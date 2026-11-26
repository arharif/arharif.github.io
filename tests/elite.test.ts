import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readingStats } from "../src/lib/readingTime.ts";
import {
  imageType,
  maxImageBytes,
} from "../supabase/functions/editorial-upload/imageType.ts";
import {
  newStack,
  stepStack,
  dropBlock,
  newBubbles,
  stepBubbles,
} from "../src/components/arcade/tableGames.ts";

test("reading time counts visible Unicode words and literal code, excludes links and image syntax", () => {
  assert.equal(
    readingStats(
      "# A title\n- See [my essay](https://example.com/article)\n![portrait](https://example.com/photo.png)\n```ts\nconst n = 2;\n```",
    ).words,
    8,
  );
  assert.equal(readingStats("word ".repeat(221)).minutes, 2);
  assert.equal(readingStats("Résumé déjà vu", 7).minutes, 7);
});
test("private upload validator checks container bytes, terminator and length", async () => {
  const image = await readFile(
    new URL("../public/art/academic-small.webp", import.meta.url),
  );
  assert.equal(imageType(image), "image/webp");
  assert.equal(imageType(image.subarray(0, -1)), undefined);
  assert.equal(
    imageType(new TextEncoder().encode("Plain-text file named photo.webp")),
    undefined,
  );
  assert.equal(imageType(new Uint8Array(maxImageBytes + 1)), undefined);
});
test("placing blocks trims overlap, misses end play, twelve layers win", () => {
  const s = newStack();
  stepStack(s, 0.1);
  assert.ok(s.x > 0);
  s.x = 220;
  dropBlock(s);
  assert.deepEqual(s.tower[1], { x: 220, width: 80 });
  for (let n = 1; n < 12; n++) {
    s.x = 220;
    dropBlock(s);
  }
  assert.ok(s.win && s.ended);
  const loss = newStack();
  dropBlock(loss);
  assert.ok(loss.ended && !loss.win);
});
test("bubble collisions pop once, clear the board and end a three-life round", () => {
  const s = newBubbles();
  for (const b of s.bubbles) {
    s.x = b.x;
    s.y = b.y + 5;
    stepBubbles(s, 0, 0);
  }
  assert.equal(s.score, 1200);
  assert.ok(s.win && s.ended);
  const loss = newBubbles();
  for (let i = 0; i < 3; i++) {
    loss.y = 257;
    stepBubbles(loss, 0, 0);
  }
  assert.equal(loss.lives, 0);
  assert.ok(loss.ended && !loss.win);
});
