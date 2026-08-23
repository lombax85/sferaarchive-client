import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import Digest from "./Digest";
import { AdminAccessProvider } from "./adminAccess";

jest.mock("react-markdown", () => ({ children }) => children);
jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test("a non-admin sees a clear denial and never calls Digest admin endpoints", async () => {
  axios.get.mockResolvedValue({ data: { is_admin: false } });

  render(
    <AdminAccessProvider>
      <Digest />
    </AdminAccessProvider>
  );

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Accesso riservato agli amministratori."
  );
  await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
  expect(axios.get).toHaveBeenCalledWith(
    "https://slack-archive.sferait.org/whoami"
  );
  expect(axios.post).not.toHaveBeenCalled();
});
