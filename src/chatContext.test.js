import { buildArchiveContextRefs } from "./chatContext";

test("context refs are validated, deduplicated and capped at 100", () => {
  const context = Array.from({ length: 105 }, (_, index) => ({
    channel: "C0BSUCGHU8G",
    timestamp: `178739${String(index).padStart(4, "0")}.104349`,
    message: `raw archive message ${index}`,
  }));
  context.unshift(context[0], {
    channel: "../../bad",
    timestamp: "1787395457.104349",
    message: "must be ignored",
  });

  const refs = buildArchiveContextRefs(context);

  expect(refs).toHaveLength(100);
  expect(new Set(refs.map(({ channel, timestamp }) => `${channel}:${timestamp}`)).size).toBe(
    100
  );
  expect(JSON.stringify(refs)).not.toContain("raw archive message");
});
