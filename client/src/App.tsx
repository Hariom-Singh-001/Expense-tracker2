import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import About from "@/pages/about"; // <--- This import is crucial
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      {/* 1. Main Dashboard */}
      <ProtectedRoute path="/" component={Dashboard} />
      
      {/* 2. The About Page (This was missing!) */}
      <Route path="/about" component={About} />
      
      {/* 3. Login/Register */}
      <Route path="/auth" component={AuthPage} />
      
      {/* 4. Catch-all for errors */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;