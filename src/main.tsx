import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import store from "./config/redux/store.ts";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar.tsx";
import { AppSidebar } from "./components/app-sidebar.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <SidebarProvider className="flex w-screen h-screen">
        <AppSidebar />
        <main className="flex-1">
          <SidebarTrigger />
          <App />
        </main>
      </SidebarProvider>
    </Provider>
  </StrictMode>
);
