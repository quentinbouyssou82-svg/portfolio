import { useEffect } from "react";
import { Routes, Route, useLocation, useOutlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ProtectedRoute, GuestRoute, FallbackRedirect } from "@/components/protected-route";
import { AppShell } from "@/components/app-shell";
import { LockScreen } from "@/pages/lock-screen";
import { HomePage } from "@/pages/home-page";
import { ImportPage } from "@/pages/import-page";
import { WorkoutLivePage } from "@/pages/workout-live-page";
import { logRouteState } from "@/lib/navigation-log";

function AnimatedLayout() {
  const location = useLocation();
  const outlet = useOutlet();

  useEffect(() => {
    logRouteState("App", {
      pathname: location.pathname,
      isLoading: false,
      hasSession: false,
      action: "render",
    });
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className="flex min-h-0 flex-1 flex-col"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route element={<AnimatedLayout />}>
          <Route element={<GuestRoute />}>
            <Route path="/lock" element={<LockScreen />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/import" element={<ImportPage />} />
            <Route path="/workout/:sessionId" element={<WorkoutLivePage />} />
          </Route>

          <Route path="*" element={<FallbackRedirect />} />
        </Route>
      </Routes>
    </AppShell>
  );
}
