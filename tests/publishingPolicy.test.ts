import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("documented publishing and media policies enforce guest, member and editorial access in PostgreSQL", async () => {
  const db = new PGlite();
  try {
    // Model the Supabase roles and storage relations in an isolated, in-memory database.
    // The supplied JWT claims here represent the identity already verified by PostgREST.
    await db.exec(`
      create role anon;
      create role authenticated;
      create schema auth;
      create function auth.jwt() returns jsonb language sql stable as
        $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
      create schema storage;
      create table storage.buckets(id text primary key,name text,public boolean);
      create table storage.objects(bucket_id text,name text);
      alter table storage.objects enable row level security;
      grant usage on schema auth,storage to anon,authenticated;
    `);
    const source = await readFile(
      new URL("../docs/supabase.sql", import.meta.url),
      "utf8",
    );
    // PostgreSQL provides gen_random_uuid natively. Timestamp extension triggers are
    // orthogonal to these RLS checks and unavailable in the WASM distribution.
    await db.exec(
      source
        .replaceAll("<ADMIN_EMAIL>", "editor@example.test")
        .replace(/create extension[^;]+;/gi, "")
        .replace(
          /create trigger[^;]+extensions\.moddatetime\(updated_at\);/gi,
          "",
        ),
    );
    await db.exec(`
      grant select,insert,update,delete on all tables in schema public to anon,authenticated;
      grant select,insert,update,delete on storage.objects to anon,authenticated;
      insert into content_entries(slug,title,content_type,status) values
        ('public-story','Published','article','published'),('private-story','Draft','article','draft');
      set role anon;
    `);
    assert.deepEqual(
      (await db.query("select slug from content_entries")).rows,
      [{ slug: "public-story" }],
    );
    const publish =
      "insert into content_entries(slug,title,content_type,status) values('new-story','Submission','article','draft')";
    const upload =
      "insert into storage.objects values('content-media','illustration.webp')";
    for (const role of ["anon", "authenticated"]) {
      await db.exec("reset role; set role " + role);
      await db.query("select set_config('request.jwt.claims',$1,false)", [
        JSON.stringify({ email: "reader@example.test" }),
      ]);
      await assert.rejects(db.exec(publish), { code: "42501" });
      await assert.rejects(db.exec(upload), { code: "42501" });
      assert.equal(
        (
          await db.query(
            "update content_entries set status='published' where slug='private-story' returning id",
          )
        ).rows.length,
        0,
      );
    }
    await db.query("select set_config('request.jwt.claims',$1,false)", [
      JSON.stringify({ email: "editor@example.test" }),
    ]);
    await db.exec(publish);
    await db.exec(upload);
    await db.exec(
      "update content_entries set status='published' where slug='new-story'",
    );
    await db.exec("reset role; set role anon; set request.jwt.claims='{}'");
    assert.deepEqual(
      (await db.query("select slug from content_entries order by slug")).rows,
      [{ slug: "new-story" }, { slug: "public-story" }],
    );
  } finally {
    await db.close();
  }
});
