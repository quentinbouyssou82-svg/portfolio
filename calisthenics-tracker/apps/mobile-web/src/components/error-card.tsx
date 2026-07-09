import { Copy, RotateCcw, ArrowLeft, AlertCircle } from "lucide-react";
import { Button, Card, Screen, Text } from "@cali/ui";
import { useState } from "react";
import { motion } from "framer-motion";

interface ErrorCardProps {
  title: string;
  message: string;
  logs?: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export function ErrorCard({
  title,
  message,
  logs,
  onRetry,
  onBack,
}: ErrorCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyLogs() {
    if (!logs) return;
    await navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Screen className="justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Card padding="lg" className="space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cali-danger/15">
            <AlertCircle className="h-6 w-6 text-cali-danger" />
          </div>
          <Text variant="subtitle">{title}</Text>
          <Text variant="body" muted className="leading-relaxed">
            {message}
          </Text>
          <div className="flex flex-col gap-2 pt-2">
            {onRetry && (
              <Button fullWidth onClick={onRetry}>
                <RotateCcw className="h-4 w-4" />
                Réessayer
              </Button>
            )}
            {onBack && (
              <Button fullWidth variant="secondary" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            )}
            {logs && (
              <Button fullWidth variant="ghost" onClick={() => void copyLogs()}>
                <Copy className="h-4 w-4" />
                {copied ? "Copié !" : "Copier les logs"}
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </Screen>
  );
}
