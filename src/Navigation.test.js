import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import Navigation from "./Navigation";
import { AdminAccessProvider } from "./adminAccess";

jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

function renderNavigation() {
  render(
    <MemoryRouter
      initialEntries={[
        "/?channel=C0BSUCGHU8G&thread_ts=1787395457.104349#token=a.b.c",
      ]}
    >
      <AdminAccessProvider>
        <Navigation />
      </AdminAccessProvider>
    </MemoryRouter>
  );
}

test("admin navigation is token-free and appears only after /whoami approval", async () => {
  axios.get.mockResolvedValue({ data: { is_admin: true } });
  renderNavigation();

  expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  expect(screen.queryByRole("link", { name: "Digest" })).not.toBeInTheDocument();

  expect(await screen.findByRole("link", { name: "Digest" })).toHaveAttribute(
    "href",
    "/digest"
  );
  expect(screen.getByRole("link", { name: "Stats" })).toHaveAttribute(
    "href",
    "/stats"
  );
  screen.getAllByRole("link").forEach((link) => {
    expect(link.getAttribute("href")).not.toMatch(/token|thread_ts|channel/);
  });
  expect(axios.get).toHaveBeenCalledWith(
    "https://slack-archive.sferait.org/whoami"
  );
});

test("non-admin navigation never exposes Digest or Stats", async () => {
  axios.get.mockResolvedValue({ data: { is_admin: false } });
  renderNavigation();

  await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
  expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Digest" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Stats" })).not.toBeInTheDocument();
});
