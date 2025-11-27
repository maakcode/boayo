import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ViewerSettingsProvider } from "@/contexts/ViewerSettingsContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ViewerSettingsProvider>
      <App />
    </ViewerSettingsProvider>
  </React.StrictMode>,
);
