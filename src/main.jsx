import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import Notes, { loader as notesLoader } from "./routes/notes";
import Edit, { action as editAction, loader as editLoader } from "./routes/edit";
import ErrorPage from "./routes/error-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Outlet />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Notes />,
        loader: notesLoader,
      },
      {
        path: "edit/:noteId",
        element: <Edit />,
        loader: editLoader,
        action: editAction,
      },
    ]
  },
], {
  basename: "/notes-mini-app/",
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);