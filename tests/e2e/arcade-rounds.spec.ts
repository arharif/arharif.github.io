import { test, expect } from "@playwright/test";

test("memory matching and replay reset the deck, timer and move counter", async ({
  page,
}) => {
  await page.goto("/games?game=haunted-memory");
  await page.getByText("Start game", { exact: true }).click();
  // Deterministic Fisher-Yates fixture leaves the two copies in matching order.
  await page.evaluate(() => {
    Math.random = () => 0.999;
  });
  await page.getByText("Deal cards").click();
  const deck = page.locator(".haunted-board button");
  for (let i = 0; i < 4; i++) {
    await deck.nth(i).click();
    await deck.nth(i + 4).click();
  }
  await expect(page.getByRole("dialog").getByRole("status")).toContainText(
    /Score [1-9]/,
  );
  await page.getByText("Restart", { exact: true }).click();
  await page.getByLabel("Difficulty").selectOption("8");
  await page.getByText("Deal cards").click();
  await expect(deck).toHaveCount(16);
  await expect(page.locator(".play-status")).toContainText("Moves 0");
});

test("all three mazes can be completed with their collectible and keyboard controls", async ({
  page,
}) => {
  await page.goto("/games?game=neon-maze-escape");
  await page.getByText("Start game", { exact: true }).click();
  const board = page.locator(".maze-board");
  for (let level = 1; level <= 3; level++) {
    for (const target of ["◆", "⚑"]) {
      const moves = await board.evaluate((el, target) => {
        const tiles = Array.from(el.children);
        const size = Math.sqrt(tiles.length);
        const start = tiles.findIndex((t) => t.textContent === "●"),
          end = tiles.findIndex((t) => t.textContent === target);
        const queue = [start],
          previous = new Map<number, [number, string]>();
        previous.set(start, [start, ""]);
        while (queue.length && !previous.has(end)) {
          const cell = queue.shift()!;
          for (const [off, key] of [
            [1, "ArrowRight"],
            [-1, "ArrowLeft"],
            [size, "ArrowDown"],
            [-size, "ArrowUp"],
          ] as const) {
            const next = cell + off;
            if (
              !tiles[next] ||
              tiles[next].classList.contains("wall") ||
              previous.has(next)
            )
              continue;
            previous.set(next, [cell, key]);
            queue.push(next);
          }
        }
        if (!previous.has(end)) throw new Error("Maze objective unreachable");
        const path = [];
        let cell = end;
        while (cell !== start) {
          const [parent, key] = previous.get(cell)!;
          path.unshift(key);
          cell = parent;
        }
        return path;
      }, target);
      await board.focus();
      for (const key of moves) await page.keyboard.press(key);
    }
  }
  await expect(page.getByRole("dialog").getByRole("status")).toContainText(
    /Score [3-6]\d\d/,
  );
  await page.getByText("Restart", { exact: true }).click();
  await expect(page.locator(".play-status")).toContainText("Maze 1/3");
});

test("quiz times out, explains the answer and records a finished five-question round", async ({
  page,
}) => {
  await page.goto("/games?game=quiz-chaos");
  await page.getByRole("button", { name: "Start game" }).click();
  await page.getByLabel("Difficulty").selectOption("6");
  await page.clock.install();
  await page.getByRole("button", { name: "Start quiz" }).click();
  await page.clock.fastForward(6500);
  await expect(page.locator(".chaos-quiz [role=status]")).toContainText(
    "Answer:",
  );
  await page.getByText("Next question").click();
  for (let i = 1; i < 5; i++) {
    await page.locator(".chaos-quiz>button").first().click();
    await page
      .getByRole("button", { name: i === 4 ? "Finish round" : "Next question" })
      .click();
  }
  await expect(page.getByRole("dialog").getByRole("status")).toContainText(
    "Round complete",
  );
});
for (const id of ["rocket-boom", "pixel-panic"]) {
  test(id + " advances, collides and restarts", async ({ page }) => {
    await page.goto("/games?game=" + id);
    await page.evaluate(() => {
      Math.random = () => 0.5;
    });
    await page.clock.install();
    await page.getByText("Start game", { exact: true }).click();
    await expect(page.locator("canvas")).toBeFocused();
    if (id === "rocket-boom") {
      await page.keyboard.down(" ");
      await page.clock.runFor(2500);
      await page.keyboard.up(" ");
      await expect(page.locator(".play-status")).toContainText(
        /Score [5-9]\d|Score \d{3}/,
      );
    }
    await page.clock.runFor(12000);
    await expect(page.getByRole("dialog").getByRole("status")).toContainText(
      /Score [1-9]/,
    );
    await page.getByText("Restart", { exact: true }).click();
    await expect(page.locator("canvas")).toBeFocused();
  });
}

test("every legacy catalogue entry opens its game and accepts keyboard input", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto("/games");
  await page.getByRole("button", { name: "All games →" }).click();
  const titles = await page
    .locator(".arcade-card")
    .filter({ has: page.locator(".legacy-icon") })
    .locator("h3")
    .allTextContents();
  expect(titles.length).toBe(21);
  for (const title of titles) {
    await page
      .getByRole("button", { name: "Play " + title, exact: true })
      .click();
    const room = page.getByRole("dialog");
    await expect(
      room.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    const action = room
      .locator(
        "button:not([aria-label='Close game']):enabled,input:enabled,select:enabled",
      )
      .first();
    await expect(action).toBeVisible();
    await action.focus();
    await expect(action).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(room).toHaveCount(0);
  }
});
