import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import CompanyDetail from "@/pages/CompanyDetail";
import Companies from "@/pages/Companies";
import Competitors from "@/pages/Competitors";
import CompetitorDetail from "@/pages/CompetitorDetail";
import MacroPower from "@/pages/MacroPower";
import MapView from "@/pages/MapView";
import NewsPage from "@/pages/NewsPage";
import QueueIntelligence from "@/pages/QueueIntelligence";
import Settings from "@/pages/Settings";
import DevBackend from "@/pages/DevBackend";
import MidstreamOpportunity from "@/pages/MidstreamOpportunity";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { applyTheme, getStoredTheme } from "@/lib/themes";

export default function App() {
  // Apply persisted theme on mount
  useEffect(() => { applyTheme(getStoredTheme()); }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/projects" component={Projects} />
          <Route path="/projects/:id" component={ProjectDetail} />
          <Route path="/news" component={NewsPage} />
          <Route path="/queue" component={QueueIntelligence} />
          <Route path="/settings" component={Settings} />
          <Route path="/companies" component={Companies} />
          <Route path="/companies/:id" component={CompanyDetail} />
          <Route path="/competitors" component={Competitors} />
          <Route path="/competitors/:id" component={CompetitorDetail} />
          <Route path="/macro" component={MacroPower} />
          <Route path="/map" component={MapView} />
          <Route path="/midstream" component={MidstreamOpportunity} />
          <Route path="/dev" component={DevBackend} />
          <Route component={NotFound} />
        </Switch>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

// cache-bust: 1774706554
