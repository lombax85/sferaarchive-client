import {
  isValidChannelId,
  isValidSlackTimestamp,
} from "./auth";

const MAX_CONTEXT_REFS = 100;

export function buildArchiveContextRefs(context) {
  const refs = [];
  const seen = new Set();

  for (const item of Array.isArray(context) ? context : []) {
    if (refs.length >= MAX_CONTEXT_REFS) break;

    const channel = String(item?.channel || "");
    const timestamp = String(item?.timestamp || "");
    if (!isValidChannelId(channel) || !isValidSlackTimestamp(timestamp)) {
      continue;
    }

    const key = `${channel}:${timestamp}`;
    if (seen.has(key)) continue;
    seen.add(key);
    refs.push({ channel, timestamp });
  }

  return refs;
}
