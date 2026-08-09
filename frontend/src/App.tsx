import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { ToastHost } from "@/components/Toast";
import Dashboard from "@/pages/Dashboard";
import CreateTicket from "@/pages/CreateTicket";
import TicketDetails from "@/pages/TicketDetails";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tickets/new" element={<CreateTicket />} />
            <Route path="/tickets/:ticketId" element={<TicketDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      <ToastHost />
    </QueryClientProvider>
  );
}
