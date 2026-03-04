import { createHashRouter } from "react-router-dom";
// import HomePage from "./pages/Home";
import ProposalOutputPage from "./pages/ProposalOutput";

export const router = createHashRouter([
  {
    path: "/",
    // element: <HomePage />,
    // Data pattern: add loader/action here when needed
    // loader: async () => { ... },
    // action: async ({ request }) => { ... },
  // },
  // {
  //   path: "/proposal-output",
    element: <ProposalOutputPage />,
  },
]);
