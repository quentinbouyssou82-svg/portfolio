import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Delete } from "lucide-react";
import { Button, PinDots, Screen, Text } from "@cali/ui";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { hapticLight, hapticError, hapticMedium } from "@/lib/haptic";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"] as const;
const MAX_PIN = 4;
const KEY_SIZE = "4.5rem";
const KEY_GAP = "1rem";

export function LockScreen() {
  const { login } = useAuth();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  async function submit(currentPin: string) {
    if (currentPin.length !== MAX_PIN) return;
    setLoading(true);
    setError(null);
    try {
      await login(currentPin);
      hapticMedium();
    } catch (e) {
      hapticError();
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin("");
      setError(e instanceof ApiError ? e.message : "Code incorrect.");
    } finally {
      setLoading(false);
    }
  }

  function handleKey(key: string) {
    if (loading) return;
    if (key === "del") {
      hapticLight();
      setPin((p) => p.slice(0, -1));
      setError(null);
      return;
    }
    if (!key || pin.length >= MAX_PIN) return;
    hapticLight();
    const next = pin + key;
    setPin(next);
    setError(null);
    if (next.length === MAX_PIN) void submit(next);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void submit(pin);
  }

  return (
    <Screen className="justify-between py-6">
      <motion.div
        className="flex flex-col items-center pt-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="mb-6 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border border-cali-border bg-cali-bg-elevated/80 shadow-cali-md"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 22 }}
        >
          <Dumbbell className="h-9 w-9 text-cali-accent" strokeWidth={1.75} />
        </motion.div>
        <Text variant="title" as="h1" className="text-center">
          Cali Tracker
        </Text>
        <Text variant="caption" muted className="mt-2 text-center max-w-[16rem]">
          Entrez votre code PIN pour déverrouiller
        </Text>
      </motion.div>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col items-center">
        <div className="flex flex-1 flex-col items-center justify-center gap-6 w-full">
          <PinDots length={pin.length} max={MAX_PIN} shake={shake} />
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="cali-text-caption text-cali-danger text-center"
            >
              {error}
            </motion.p>
          )}
        </div>

        <div
          className="grid grid-cols-3 place-items-center pb-2"
          style={{
            gap: KEY_GAP,
            gridTemplateColumns: `repeat(3, ${KEY_SIZE})`,
          }}
        >
          {KEYS.map((key, idx) => {
            if (key === "") {
              return <div key={idx} style={{ width: KEY_SIZE, height: KEY_SIZE }} />;
            }
            const isDel = key === "del";
            return (
              <Button
                key={key}
                type="button"
                variant="secondary"
                size="pin"
                disabled={loading}
                onClick={() => handleKey(key)}
                className="!shadow-cali-sm"
              >
                {isDel ? (
                  <Delete className="h-7 w-7 text-cali-text-muted" strokeWidth={1.5} />
                ) : (
                  <span className="font-medium tracking-tight">{key}</span>
                )}
              </Button>
            );
          })}
        </div>
      </form>
    </Screen>
  );
}
