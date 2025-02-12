import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./routes/home/Home";
import Dashboard from "./routes/dashboard/Dashboard";
import Chat from "./routes/chat/Chat";
import RootLayout from "./layouts/rootLayout/RootLayout";
import DashboardLayout from "./layouts/dashboardlayout/DashboardLayout";
import Login from "./routes/auth/Login";
import Register from "./routes/auth/Register";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login/*",
        element: <Login />,
      },
      {
        path: "/register/*",
        element: <Register />,
      },
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/dashboard/chats/:id", element: <Chat /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
