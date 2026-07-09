/** Retour haptique léger si disponible (iOS / Android). */
export function hapticLight(): void {
  try {
    navigator.vibrate?.(10);
  } catch {
    /* ignore */
  }
}

export function hapticMedium(): void {
  try {
    navigator.vibrate?.(20);
  } catch {
    /* ignore */
  }
}

export function hapticError(): void {
  try {
    navigator.vibrate?.([30, 40, 30]);
  } catch {
    /* ignore */
  }
}
