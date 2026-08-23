import {
  escapeHtml,
  isSafeArchivedImageUrl,
  isSafeSlackPermalink,
  sanitizeSlackMarkup,
} from "./slackMarkup";

test("removes executable HTML and unsafe URLs from archived Slack content", () => {
  const sanitized = sanitizeSlackMarkup(`
<script>window.pwned = true</script>
<img src="x" onerror="window.pwned = true">
<a href="javascript:alert(1)" style="position:fixed">click</a>
`);

  expect(sanitized).not.toMatch(/script|onerror|javascript:|style=/i);
  expect(sanitized).not.toContain("<img");
  expect(sanitized).toContain("click");
});

test("archived images cannot load tracking pixels from third-party hosts", () => {
  const sanitized = sanitizeSlackMarkup(`
<img src="https://tracker.example/pixel.gif">
<img src="https://avatars.slack-edge.com/trusted.png">
<img src="data:image/png;base64,iVBORw0KGgo=">
<picture><source srcset="https://tracker.example/pixel.webp"><img src="x"></picture>
`);

  expect(sanitized).not.toContain("tracker.example");
  expect(sanitized).not.toContain("srcset");
  expect(sanitized).toContain("https://avatars.slack-edge.com/trusted.png");
  expect(sanitized).toContain("data:image/png;base64,iVBORw0KGgo=");
  expect(sanitized).toContain('referrerpolicy="no-referrer"');

  expect(isSafeArchivedImageUrl("https://files.slack.com/file.png")).toBe(true);
  expect(isSafeArchivedImageUrl("https://slack.com.evil.example/pixel")).toBe(
    false
  );
  expect(isSafeArchivedImageUrl("https://tracker.example/pixel")).toBe(false);
});

test("escapes dynamic Slack metadata before inserting it into markup", () => {
  expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe(
    "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"
  );
});

test("renders only HTTPS Slack permalinks", () => {
  expect(
    isSafeSlackPermalink(
      "https://sferait-ws.slack.com/archives/C0BSUCGHU8G/p1787395457104349"
    )
  ).toBe(true);
  expect(isSafeSlackPermalink("javascript:alert(1)")).toBe(false);
  expect(isSafeSlackPermalink("https://slack.com.evil.example/archive")).toBe(
    false
  );
});
