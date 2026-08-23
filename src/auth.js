export const AUTH_TOKEN_STORAGE_KEY = "sferaarchive.auth.token";

const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const CHANNEL_ID_PATTERN = /^[A-Z][A-Z0-9]{8,}$/;
const SLACK_TIMESTAMP_PATTERN = /^\d{10,}\.\d{1,6}$/;
const SLACK_USER_ID_PATTERN = /^[UW][A-Z0-9]{2,31}$/;
const SAFE_APP_PATHS = new Set(["/", "/digest", "/stats"]);
const DEEP_LINK_KEYS = ["channel", "thread_ts", "message_ts"];

function decodeBase64UrlJson(value) {
  try {
    const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
    if (normalized.length % 4 === 1) return null;
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );
    const binary = window.atob(padded);
    const percentEncoded = Array.from(binary, (character) =>
      `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`
    ).join("");
    const decoded = decodeURIComponent(percentEncoded);
    const payload = JSON.parse(decoded);
    return payload && typeof payload === "object" && !Array.isArray(payload)
      ? payload
      : null;
  } catch {
    return null;
  }
}

export function readJwtPayload(token) {
  if (
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > 8192 ||
    !JWT_PATTERN.test(token)
  ) {
    return null;
  }

  return decodeBase64UrlJson(token.split(".")[1]);
}

export function isValidJwt(
  token,
  nowSeconds = Math.floor(Date.now() / 1000)
) {
  const payload = readJwtPayload(token);
  const claimNames = payload ? Object.keys(payload).sort() : [];
  // Temporary rollout compatibility: v2.1.1 signed a third `slack_token`
  // claim. The frontend never reads that claim and strips the URL immediately;
  // this branch exists only so the backend can be upgraded without a login loop.
  const acceptedClaims =
    (claimNames.length === 2 &&
      claimNames[0] === "exp" &&
      claimNames[1] === "user_id") ||
    (claimNames.length === 3 &&
      claimNames[0] === "exp" &&
      claimNames[1] === "slack_token" &&
      claimNames[2] === "user_id" &&
      typeof payload.slack_token === "string");
  return Boolean(
    payload &&
      acceptedClaims &&
      typeof payload.user_id === "string" &&
      SLACK_USER_ID_PATTERN.test(payload.user_id) &&
      typeof payload.exp === "number" &&
      Number.isSafeInteger(payload.exp) &&
      payload.exp > nowSeconds
  );
}

export function isValidChannelId(channelId) {
  return typeof channelId === "string" && CHANNEL_ID_PATTERN.test(channelId);
}

export function isValidSlackTimestamp(timestamp) {
  return (
    typeof timestamp === "string" && SLACK_TIMESTAMP_PATTERN.test(timestamp)
  );
}

export function parseArchiveDeepLink(search = "") {
  const params = new URLSearchParams(search);
  const hasDeepLink = DEEP_LINK_KEYS.some((key) => params.has(key));
  if (!hasDeepLink) return null;

  const channel = params.get("channel") || "";
  const threadTs = params.get("thread_ts") || "";
  const messageTs = params.get("message_ts") || threadTs;

  if (
    !isValidChannelId(channel) ||
    !isValidSlackTimestamp(threadTs) ||
    !isValidSlackTimestamp(messageTs)
  ) {
    return null;
  }

  return Object.freeze({
    channel,
    threadTs,
    messageTs,
  });
}

export function buildArchiveSearch(deepLink) {
  if (
    !deepLink ||
    !isValidChannelId(deepLink.channel) ||
    !isValidSlackTimestamp(deepLink.threadTs) ||
    !isValidSlackTimestamp(deepLink.messageTs)
  ) {
    throw new TypeError("Invalid SferaArchive deep link");
  }

  const params = new URLSearchParams({
    channel: deepLink.channel,
    thread_ts: deepLink.threadTs,
    message_ts: deepLink.messageTs,
  });
  return `?${params.toString()}`;
}

export function buildThreadApiPath(deepLink) {
  if (
    !deepLink ||
    !isValidChannelId(deepLink.channel) ||
    !isValidSlackTimestamp(deepLink.threadTs)
  ) {
    throw new TypeError("Invalid SferaArchive thread path");
  }

  return `/thread/${encodeURIComponent(deepLink.channel)}/${encodeURIComponent(
    deepLink.threadTs
  )}`;
}

function fragmentParams(hash = "") {
  return new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
}

function safeStorageGet(storage) {
  try {
    return storage?.getItem(AUTH_TOKEN_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function safeStorageSet(storage, token) {
  try {
    storage?.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } catch {
    // Storage may be disabled. The current page can still use the URL token.
  }
}

function safeStorageRemove(storage) {
  try {
    storage?.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // Nothing else to clean up when storage is unavailable.
  }
}

export function clearStoredAuth(storage = window.sessionStorage) {
  safeStorageRemove(storage);
}

export function buildSafeReturnTo(locationLike) {
  const pathname = SAFE_APP_PATHS.has(locationLike?.pathname)
    ? locationLike.pathname
    : "/";
  const deepLink = pathname === "/" ? parseArchiveDeepLink(locationLike.search) : null;
  return `${pathname}${deepLink ? buildArchiveSearch(deepLink) : ""}`;
}

export function buildLoginUrl(apiUrl, returnTo) {
  const safeApiUrl = String(apiUrl || "").replace(/\/+$/, "");
  const params = new URLSearchParams({ return_to: returnTo || "/" });
  return `${safeApiUrl}/login?${params.toString()}`;
}

export function installAxiosUnauthorizedHandler({
  axiosClient,
  apiUrl,
  storage = window.sessionStorage,
  getLocation = () => window.location,
  redirect = (url) => window.location.replace(url),
} = {}) {
  if (!axiosClient?.interceptors?.response?.use) {
    throw new TypeError("An Axios client with response interceptors is required");
  }

  let redirectStarted = false;
  return axiosClient.interceptors.response.use(undefined, (error) => {
    if (error?.response?.status === 401 && !redirectStarted) {
      redirectStarted = true;
      clearStoredAuth(storage);
      if (axiosClient.defaults?.headers?.common) {
        delete axiosClient.defaults.headers.common.Authorization;
      }
      const returnTo = buildSafeReturnTo(getLocation());
      redirect(buildLoginUrl(apiUrl, returnTo));
    }

    return Promise.reject(error);
  });
}

export function bootstrapAuth({
  location = window.location,
  history = window.history,
  storage = window.sessionStorage,
} = {}) {
  const query = new URLSearchParams(location.search || "");
  const fragment = fragmentParams(location.hash || "");
  const fragmentToken = fragment.get("token") || "";
  const legacyQueryToken = query.get("token") || "";
  const urlToken = isValidJwt(fragmentToken)
    ? fragmentToken
    : isValidJwt(legacyQueryToken)
    ? legacyQueryToken
    : "";

  query.delete("token");
  fragment.delete("token");
  const cleanSearch = query.toString() ? `?${query.toString()}` : "";
  const cleanHash = fragment.toString() ? `#${fragment.toString()}` : "";
  const cleanRelativeUrl = `${location.pathname || "/"}${cleanSearch}${cleanHash}`;

  if (fragmentToken || legacyQueryToken) {
    history.replaceState(history.state ?? null, "", cleanRelativeUrl);
  }

  if (urlToken) safeStorageSet(storage, urlToken);
  let token = urlToken || safeStorageGet(storage);
  if (!isValidJwt(token)) {
    safeStorageRemove(storage);
    token = "";
  }

  const cleanLocation = {
    pathname: location.pathname || "/",
    search: cleanSearch,
  };

  return {
    token,
    cleanRelativeUrl,
    deepLink: parseArchiveDeepLink(cleanSearch),
    returnTo: buildSafeReturnTo(cleanLocation),
  };
}
