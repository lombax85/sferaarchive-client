import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import App from "./App";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    defaults: { headers: { common: {} } },
    get: jest.fn(),
    post: jest.fn(),
  },
}));
jest.mock("emoji-datasource/emoji.json", () => []);
jest.mock("./components/Chatbot", () => ({ onSendMessage }) => (
  <button data-testid="send-chat" onClick={() => onSendMessage("Question")}>
    Send test chat
  </button>
));

const CHANNEL = "C0BSUCGHU8G";
const THREAD_TS = "1787395457.104349";
const MESSAGE_TS = "1787395460.204349";

function mockArchiveApi() {
  axios.get.mockImplementation((url) => {
    if (url.endsWith("/channels")) {
      return Promise.resolve({ data: [{ id: CHANNEL, name: "general" }] });
    }
    if (url.endsWith("/users")) return Promise.resolve({ data: [] });
    if (url.endsWith("/emoji")) return Promise.resolve({ data: { emoji: {} } });
    if (url.endsWith("/whoami")) {
      return Promise.resolve({
        data: {
          user_id: "U123",
          username: "tester",
          opted_out: false,
          opted_out_ai: false,
        },
      });
    }
    if (url.includes(`/thread/${CHANNEL}/${THREAD_TS}`)) {
      return Promise.resolve({
        data: [
          {
            channel: CHANNEL,
            timestamp: THREAD_TS,
            thread_ts: THREAD_TS,
            user_name: "root",
            message: "Root message",
            permalink: `https://sferait-ws.slack.com/archives/${CHANNEL}`,
          },
          {
            channel: CHANNEL,
            timestamp: MESSAGE_TS,
            thread_ts: THREAD_TS,
            user_name: "reply",
            message: '<img src="x" onerror="window.pwned=true">Target reply',
            permalink: `https://sferait-ws.slack.com/archives/${CHANNEL}`,
          },
        ],
      });
    }
    if (url.includes(`/messages/${CHANNEL}`)) {
      return Promise.resolve({ data: [] });
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockArchiveApi();
  axios.post.mockResolvedValue({
    data: {
      status: "success",
      conversation: [
        { user_name: "AI", message: "Answer", timestamp: 1787395461 },
      ],
    },
  });
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

test("loads a validated channel-scoped deep link and highlights its message", async () => {
  render(
    <MemoryRouter
      initialEntries={[
        `/?channel=${CHANNEL}&thread_ts=${THREAD_TS}&message_ts=${MESSAGE_TS}`,
      ]}
    >
      <App />
    </MemoryRouter>
  );

  await waitFor(() =>
    expect(axios.get).toHaveBeenCalledWith(
      `https://slack-archive.sferait.org/thread/${CHANNEL}/${THREAD_TS}`
    )
  );

  const target = await screen.findByTestId(`thread-message-${MESSAGE_TS}`);
  expect(target).toHaveAttribute("data-highlighted", "true");
  expect(target).toHaveTextContent("Target reply");
  expect(target.querySelector("[onerror]")).toBeNull();
  await waitFor(() =>
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled()
  );
});

test("does not request a thread for malformed deep-link parameters", async () => {
  render(
    <MemoryRouter
      initialEntries={[
        `/?channel=${CHANNEL}%2F..%2Fsecret&thread_ts=${THREAD_TS}&message_ts=${MESSAGE_TS}`,
      ]}
    >
      <App />
    </MemoryRouter>
  );

  await waitFor(() =>
    expect(axios.get).toHaveBeenCalledWith(
      "https://slack-archive.sferait.org/whoami"
    )
  );
  expect(
    axios.get.mock.calls.some(([url]) => String(url).includes("/thread/"))
  ).toBe(false);
});

test("/chat sends archive references without raw archived messages", async () => {
  render(
    <MemoryRouter
      initialEntries={[
        `/?channel=${CHANNEL}&thread_ts=${THREAD_TS}&message_ts=${MESSAGE_TS}`,
      ]}
    >
      <App />
    </MemoryRouter>
  );

  await screen.findByTestId(`thread-message-${MESSAGE_TS}`);
  fireEvent.click(screen.getByRole("button", { name: "Chat with thread" }));
  fireEvent.click(await screen.findByTestId("send-chat"));

  await waitFor(() =>
    expect(axios.post).toHaveBeenCalledWith(
      "https://slack-archive.sferait.org/chat",
      expect.any(Object)
    )
  );
  const payload = axios.post.mock.calls.find(([url]) => url.endsWith("/chat"))[1];

  expect(payload).not.toHaveProperty("context");
  expect(payload.context_refs).toEqual([
    { channel: CHANNEL, timestamp: THREAD_TS },
    { channel: CHANNEL, timestamp: MESSAGE_TS },
  ]);
  expect(JSON.stringify(payload)).not.toContain("Root message");
  expect(JSON.stringify(payload)).not.toContain("Target reply");
});
