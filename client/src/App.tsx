import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Web3Provider } from "@/hooks/use-web3";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Marketplace from "@/pages/Marketplace";
import MyJobs from "@/pages/MyJobs";
import Documentation from "@/pages/Documentation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/jobs" component={MyJobs} />
      <Route path="/docs" component={Documentation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </Web3Provider>
    </QueryClientProvider>
  );
}

export default App;
