import {
  AUTH_TOKEN_STORAGE_KEY,
  bootstrapAuth,
  buildArchiveSearch,
  buildLoginUrl,
  buildSafeReturnTo,
  buildThreadApiPath,
  installAxiosUnauthorizedHandler,
  isValidJwt,
  parseArchiveDeepLink,
} from "./auth";

function encodeJwtPart(value) {
  return window
    .btoa(JSON.stringify(value))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

function makeToken(payload) {
  return `${encodeJwtPart({ alg: "HS256", typ: "JWT" })}.${encodeJwtPart(
    payload
  )}.signature`;
}

const TOKEN = makeToken({ user_id: "U123", exp: 4102444800 });
const CHANNEL = "C0BSUCGHU8G";
const THREAD_TS = "1787395457.104349";
const MESSAGE_TS = "1787395460.204349";
const DEEP_SEARCH = `?channel=${CHANNEL}&thread_ts=${THREAD_TS}&message_ts=${MESSAGE_TS}`;

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: jest.fn((key) => values.get(key) || null),
    setItem: jest.fn((key, value) => values.set(key, value)),
    removeItem: jest.fn((key) => values.delete(key)),
  };
}

test("consumes a fragment JWT, stores it per tab and removes it from history", () => {
  const storage = memoryStorage();
  const history = { state: { existing: true }, replaceState: jest.fn() };
  const auth = bootstrapAuth({
    location: {
      pathname: "/",
      search: DEEP_SEARCH,
      hash: `#token=${TOKEN}`,
    },
    history,
    storage,
  });

  expect(auth.token).toBe(TOKEN);
  expect(storage.setItem).toHaveBeenCalledWith(AUTH_TOKEN_STORAGE_KEY, TOKEN);
  expect(history.replaceState).toHaveBeenCalledWith(
    history.state,
    "",
    `/${DEEP_SEARCH}`
  );
  expect(auth.returnTo).toBe(`/${DEEP_SEARCH}`);
  expect(JSON.stringify(auth)).not.toContain("token=");
});

test("accepts a legacy query JWT only for migration and strips it immediately", () => {
  const storage = memoryStorage();
  const history = { state: null, replaceState: jest.fn() };
  const auth = bootstrapAuth({
    location: {
      pathname: "/",
      search: `${DEEP_SEARCH}&token=${TOKEN}`,
      hash: "",
    },
    history,
    storage,
  });

  expect(auth.token).toBe(TOKEN);
  expect(history.replaceState.mock.calls[0][2]).toBe(`/${DEEP_SEARCH}`);
  expect(history.replaceState.mock.calls[0][2]).not.toContain(TOKEN);
});

test("builds only validated, token-free archive and API URLs", () => {
  const deepLink = parseArchiveDeepLink(DEEP_SEARCH);
  expect(deepLink).toEqual({
    channel: CHANNEL,
    threadTs: THREAD_TS,
    messageTs: MESSAGE_TS,
  });
  expect(buildArchiveSearch(deepLink)).toBe(DEEP_SEARCH);
  expect(buildThreadApiPath(deepLink)).toBe(
    `/thread/${CHANNEL}/${THREAD_TS}`
  );
  expect(buildArchiveSearch(deepLink)).not.toContain("token");
});

test("drops malformed or off-site return targets before OAuth", () => {
  const unsafe = {
    pathname: "//evil.example/steal",
    search: `?channel=${CHANNEL}/../../secret&thread_ts=${THREAD_TS}`,
  };
  expect(parseArchiveDeepLink(unsafe.search)).toBeNull();
  expect(buildSafeReturnTo(unsafe)).toBe("/");

  const loginUrl = buildLoginUrl(
    "https://slack-archive.sferait.org",
    `/${DEEP_SEARCH}`
  );
  expect(loginUrl).toContain("/login?return_to=");
  expect(decodeURIComponent(loginUrl)).toContain(`/${DEEP_SEARCH}`);
  expect(loginUrl).not.toContain(TOKEN);
});

test("accepts only unexpired JWTs with valid Slack user claims", () => {
  expect(isValidJwt(TOKEN, 2000000000)).toBe(true);
  expect(
    isValidJwt(makeToken({ user_id: "U123", exp: 1999999999 }), 2000000000)
  ).toBe(false);
  expect(isValidJwt(makeToken({ user_id: "U123" }), 2000000000)).toBe(false);
  expect(
    isValidJwt(
      makeToken({ user_id: "../../not-a-slack-user", exp: 4102444800 }),
      2000000000
    )
  ).toBe(false);
  expect(
    isValidJwt(makeToken({ user_id: "U123", exp: "4102444800" }), 2000000000)
  ).toBe(false);
  expect(
    isValidJwt(
      makeToken({
        user_id: "U123",
        exp: 4102444800,
        slack_token: "legacy-claim-must-be-rejected",
      }),
      2000000000
    )
  ).toBe(false);
});

test("removes an expired stored JWT during bootstrap", () => {
  const expiredToken = makeToken({ user_id: "U123", exp: 100 });
  const storage = memoryStorage({
    [AUTH_TOKEN_STORAGE_KEY]: expiredToken,
  });

  const auth = bootstrapAuth({
    location: { pathname: "/", search: DEEP_SEARCH, hash: "" },
    history: { state: null, replaceState: jest.fn() },
    storage,
  });

  expect(auth.token).toBe("");
  expect(storage.removeItem).toHaveBeenCalledWith(AUTH_TOKEN_STORAGE_KEY);
});

test("a global Axios 401 clears auth and restarts OAuth with safe return_to", async () => {
  let rejectResponse;
  const axiosClient = {
    defaults: {
      headers: { common: { Authorization: `Bearer ${TOKEN}` } },
    },
    interceptors: {
      response: {
        use: jest.fn((_, rejectionHandler) => {
          rejectResponse = rejectionHandler;
          return 7;
        }),
      },
    },
  };
  const storage = memoryStorage({ [AUTH_TOKEN_STORAGE_KEY]: TOKEN });
  const redirect = jest.fn();

  expect(
    installAxiosUnauthorizedHandler({
      axiosClient,
      apiUrl: "https://slack-archive.sferait.org",
      storage,
      getLocation: () => ({ pathname: "/", search: DEEP_SEARCH }),
      redirect,
    })
  ).toBe(7);

  const error = { response: { status: 401 } };
  await expect(rejectResponse(error)).rejects.toBe(error);

  expect(storage.removeItem).toHaveBeenCalledWith(AUTH_TOKEN_STORAGE_KEY);
  expect(axiosClient.defaults.headers.common.Authorization).toBeUndefined();
  expect(redirect).toHaveBeenCalledTimes(1);
  const loginUrl = new URL(redirect.mock.calls[0][0]);
  expect(loginUrl.pathname).toBe("/login");
  expect(loginUrl.searchParams.get("return_to")).toBe(`/${DEEP_SEARCH}`);

  await expect(rejectResponse(error)).rejects.toBe(error);
  expect(redirect).toHaveBeenCalledTimes(1);
});
