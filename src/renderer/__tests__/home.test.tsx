import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import HomePage from "../pages/Home";

// Create a test router with the same route configuration
const createTestRouter = (initialEntries = ["/"]) => {
  return createMemoryRouter(
    [
      {
        path: "/",
        element: <HomePage />,
      },
    ],
    { initialEntries }
  );
};

describe("Home Route", () => {
  it("renders the home page at root path", () => {
    const router = createTestRouter(["/"]);
    render(<RouterProvider router={router} />);

    expect(screen.getByText("👋 Hello World!")).toBeInTheDocument();
  });

  it("displays the welcome message", () => {
    const router = createTestRouter(["/"]);
    render(<RouterProvider router={router} />);

    expect(screen.getByText("Welcome to Freeman Proposal Builder")).toBeInTheDocument();
  });

  it("displays the tech stack information", () => {
    const router = createTestRouter(["/"]);
    render(<RouterProvider router={router} />);

    expect(
      screen.getByText("Built with Electron + React + TypeScript + TailwindCSS")
    ).toBeInTheDocument();
  });
});
