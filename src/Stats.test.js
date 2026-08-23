import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import Stats, { buildStatsArchiveThreadUrl } from "./Stats";
import { AdminAccessProvider } from "./adminAccess";

jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test("a non-admin sees a clear denial and never calls Stats admin endpoints", async () => {
  axios.get.mockResolvedValue({ data: { is_admin: false } });

  render(
    <AdminAccessProvider>
      <Stats />
    </AdminAccessProvider>
  );

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Accesso riservato agli amministratori."
  );
  await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
  expect(axios.get).toHaveBeenCalledWith(
    "https://slack-archive.sferait.org/whoami"
  );
});

test("engaging threads use a channel-scoped SferaArchive deep link", () => {
  expect(
    buildStatsArchiveThreadUrl(
      {
        channel_id: "C0BSUCGHU8G",
        thread_ts: "1787395457.104349",
      },
      "https://sferaarchive-client.vercel.app"
    )
  ).toBe(
    "https://sferaarchive-client.vercel.app/?channel=C0BSUCGHU8G&thread_ts=1787395457.104349&message_ts=1787395457.104349"
  );

  expect(
    buildStatsArchiveThreadUrl(
      { thread_ts: "1787395457.104349" },
      "https://sferaarchive-client.vercel.app"
    )
  ).toBeNull();
});
