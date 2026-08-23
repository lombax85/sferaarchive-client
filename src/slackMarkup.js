import DOMPurify from "dompurify";
import { marked } from "marked";

const MARKED_OPTIONS = {
  async: false,
  breaks: true,
  gfm: true,
};

const SAFE_DATA_IMAGE_PATTERN =
  /^data:image\/(?:avif|gif|jpe?g|png|webp);base64,[a-z0-9+/=\s]+$/i;

function isTrustedSlackHost(hostname) {
  const normalized = String(hostname || "").toLowerCase();
  return (
    normalized === "slack.com" ||
    normalized.endsWith(".slack.com") ||
    normalized === "slack-edge.com" ||
    normalized.endsWith(".slack-edge.com")
  );
}

export function isSafeArchivedImageUrl(value) {
  const source = String(value || "");
  if (SAFE_DATA_IMAGE_PATTERN.test(source)) return true;

  try {
    const url = new URL(source);
    return (
      url.protocol === "https:" &&
      (!url.port || url.port === "443") &&
      isTrustedSlackHost(url.hostname)
    );
  } catch {
    return false;
  }
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function sanitizeSlackMarkup(message) {
  const rendered = marked.parse(String(message ?? ""), MARKED_OPTIONS);
  const sanitized = DOMPurify.sanitize(rendered, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: [
      "audio",
      "base",
      "embed",
      "form",
      "iframe",
      "input",
      "meta",
      "object",
      "picture",
      "script",
      "source",
      "style",
      "template",
      "video",
    ],
    FORBID_ATTR: ["srcset", "style"],
  });

  const template = document.createElement("template");
  template.innerHTML = sanitized;
  template.content.querySelectorAll("img").forEach((image) => {
    if (!isSafeArchivedImageUrl(image.getAttribute("src"))) {
      image.remove();
      return;
    }

    image.removeAttribute("srcset");
    image.setAttribute("loading", "lazy");
    image.setAttribute("referrerpolicy", "no-referrer");
  });
  return template.innerHTML;
}

export function isSafeSlackPermalink(value) {
  try {
    const url = new URL(String(value || ""));
    return (
      url.protocol === "https:" &&
      (url.hostname === "slack.com" || url.hostname.endsWith(".slack.com"))
    );
  } catch {
    return false;
  }
}
