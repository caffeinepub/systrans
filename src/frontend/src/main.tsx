import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import AdminPanel from "./AdminPanel";
import App from "./App";
import CareersPage from "./CareersPage";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const queryClient = new QueryClient();

const path = window.location.pathname;
let PageComponent: React.ComponentType;
if (path === "/admin" || path.startsWith("/admin/")) {
  PageComponent = AdminPanel;
} else if (path === "/careers" || path.startsWith("/careers/")) {
  PageComponent = CareersPage;
} else {
  PageComponent = App;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      <PageComponent />
    </InternetIdentityProvider>
  </QueryClientProvider>,
);
