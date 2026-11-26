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
      create function auth.uid() returns uuid language sql stable as $$ select (auth.jwt()->>'sub')::uuid $$;
      create schema storage;
      create table storage.buckets(id text primary key,name text,public boolean, file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(bucket_id text,name text);
      alter table storage.objects enable row level security;
      grant usage on schema auth,storage to anon,authenticated;
    `);
    const owner = "00000000-0000-4000-8000-000000000001";
    const member = "00000000-0000-4000-8000-000000000002";
    const source = await readFile(
      new URL("../docs/supabase.sql", import.meta.url),
      "utf8",
    );
    // PostgreSQL provides gen_random_uuid natively. Timestamp extension triggers are
    // orthogonal to these RLS checks and unavailable in the WASM distribution.
    await db.exec(
      source
        .replaceAll("<OWNER_UUID>", owner)
        .replace(/create extension[^;]+;/gi, "")
        .replace(
          /create trigger[^;]+extensions\.moddatetime\(updated_at\);/gi,
          "",
        ),
    );
    await db.exec(`
      grant select,insert,update,delete on all tables in schema public to anon,authenticated;
      grant select,insert,update,delete on storage.objects to anon,authenticated;
      insert into content(slug,title,content_type,body,status) values
        ('public-story','Published','article','Example text','published'),('private-story','Draft','article','Draft body','draft');
      set role anon;
    `);
    assert.deepEqual(
      (await db.query("select slug from content")).rows,
      [{ slug: "public-story" }],
    );
    const publish =
      "insert into content(slug,title,content_type,body,status) values('new-story','Submission','article','Draft body','draft')";
    const upload =
      "insert into storage.objects values('content-media','illustration.webp')";
    for (const [role,sub,aal] of [["anon",member,"aal1"], ["authenticated",member,"aal2"], ["authenticated",owner,"aal1"]]) {
      await db.exec("reset role; set role " + role);
      await db.query("select set_config('request.jwt.claims',$1,false)", [
        JSON.stringify({sub,aal}),
      ]);
      await assert.rejects(db.exec(publish), { code: "42501" });
      await assert.rejects(db.exec(upload), { code: "42501" });
      assert.equal(
        (
          await db.query(
            "update content set status='published' where slug='private-story' returning id",
          )
        ).rows.length,
        0,
      );
    }
    await db.query("select set_config('request.jwt.claims',$1,false)", [
      JSON.stringify({sub:owner,aal:"aal2"}),
    ]);
    await db.exec(publish);
    await db.exec(upload);
    await assert.rejects(db.exec("insert into storage.objects values('x1-editorial','direct.webp')"), {code:'42501'});
    await db.exec("reset role; insert into storage.objects values('x1-editorial','cover.webp'); set role authenticated");
    await db.exec("update content set cover_image_url='https://example.test/storage/v1/object/x1-editorial/cover.webp' where slug='new-story'");
    await db.exec("set role anon; set request.jwt.claims='{}'");
    assert.equal((await db.query("select name from storage.objects where bucket_id='x1-editorial'")).rows.length,0);
    await db.exec("set role authenticated");
    await db.query("select set_config('request.jwt.claims',$1,false)", [JSON.stringify({sub:owner,aal:"aal2"})]);
    await db.exec(
      "update content set status='published' where slug='new-story'",
    );
    await db.exec("reset role; set role anon; set request.jwt.claims='{}'");
    assert.equal((await db.query("select name from storage.objects where bucket_id='x1-editorial'")).rows.length,1);
    assert.deepEqual(
      (await db.query("select slug from content order by slug")).rows,
      [{ slug: "new-story" }, { slug: "public-story" }],
    );
  } finally {
    await db.close();
  }
});
