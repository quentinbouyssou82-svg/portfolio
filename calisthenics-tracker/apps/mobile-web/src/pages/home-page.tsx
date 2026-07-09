import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Activity, ChevronRight, LogOut, Plus, Wifi, WifiOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, Card, Screen, Text } from "@cali/ui";
import type { HealthStatus } from "@cali/types";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function HomePage() {
  const { logout } = useAuth();

  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: () => apiFetch<HealthStatus>("/api/health"),
    refetchInterval: 30_000,
  });

  const ollamaOk = health?.ollama === "ok";

  return (
    <Screen>
      <motion.header
        className="mb-6 flex items-start justify-between"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <Text variant="label" muted className="text-cali-accent">
            Calisthenics
          </Text>
          <Text variant="title" as="h1" className="mt-1">
            Tracker
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 cali-text-label ${
              ollamaOk
                ? "bg-cali-success/12 text-cali-success ring-1 ring-cali-success/20"
                : "bg-cali-warning/12 text-cali-warning ring-1 ring-cali-warning/20"
            }`}
          >
            {ollamaOk ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {ollamaOk ? "IA locale" : "Hors ligne"}
          </span>
          <Button variant="ghost" size="icon" onClick={() => void logout()}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </motion.header>

      <motion.main
        className="flex flex-1 flex-col gap-4"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Link to="/import" className="block">
            <Card padding="lg" interactive className="group">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cali-accent/15">
                  <Activity className="h-6 w-6 text-cali-accent" />
                </div>
                <ChevronRight className="h-5 w-5 text-cali-text-muted transition-transform group-active:translate-x-0.5" />
              </div>
              <Text variant="subtitle" as="h2" className="mt-4">
                Nouvelle séance
              </Text>
              <Text variant="caption" muted className="mt-2 block leading-relaxed">
                Collez votre programme au format Markdown — import instantané.
              </Text>
              <Button fullWidth size="lg" className="mt-5 pointer-events-none">
                <Plus className="h-5 w-5" />
                Importer
              </Button>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Text variant="label" muted className="mb-3 block px-1">
            Fonctionnalités
          </Text>
          <Card padding="md">
            <ul className="space-y-3">
              {[
                "Parsing IA via format Markdown officiel",
                "Timers intelligents & state machine",
                "Logging instantané par série",
              ].map((line) => (
                <li key={line} className="flex items-center gap-3 cali-text-caption text-cali-text-muted">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cali-accent/80" />
                  {line}
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      </motion.main>
    </Screen>
  );
}
