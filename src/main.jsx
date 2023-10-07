import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import Notes, { action as deleteAction, loader as notesLoader } from "./routes/notes";
import Edit, { action as editAction, loader as editLoader } from "./routes/edit";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Outlet />,
    children: [
      {
        path: "/",
        element: <Notes />,
        loader: notesLoader,
        action: deleteAction,
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