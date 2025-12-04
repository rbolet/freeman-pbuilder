import { createHashRouter } from "react-router-dom";
import HomePage from "./pages/Home";

export const router = createHashRouter([
  {
    path: "/",
    element: <HomePage />,
    // Data pattern: add loader/action here when needed
    // loader: async () => { ... },
    // action: async ({ request }) => { ... },
  },
]);
