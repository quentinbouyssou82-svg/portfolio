"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, ExternalLink, Store } from "lucide-react";
import {
  GROCERY_PROVIDER_LIST,
  getProviderStores,
  type GroceryProviderId,
} from "@/lib/maison/grocery-providers/config";
import type { GroceryIntegration } from "@/lib/maison/types";

type Props = {
  integration: GroceryIntegration | null;
  onConnect: (provider: GroceryProviderId, mode: "mock" | "manual", storeId?: string) => Promise<void>;
  disabled?: boolean;
};

export function GroceryProviderStep({ integration, onConnect, disabled }: Props) {
  const [pending, startTransition] = useTransition();
  const [selectedProvider, setSelectedProvider] = useState<GroceryProviderId>(
    integration?.provider ?? "leclerc_drive",
  );

  const stores = useMemo(() => getProviderStores(selectedProvider), [selectedProvider]);
  const [selectedStore, setSelectedStore] = useState(
    integration?.storeId ?? stores[stores.length - 1]?.id ?? "",
  );

  const config = GROCERY_PROVIDER_LIST.find((p) => p.id === selectedProvider)!;
  const connected =
    integration?.status === "connected_mock" || integration?.status === "connected";
  const manual = integration?.status === "manual";
  const isActiveProvider = integration?.provider === selectedProvider;
  const showConnectForm = !isActiveProvider || (!connected && !manual);

  const connectedStoreLabel = useMemo(() => {
    if (!integration?.provider || !integration.storeId) return null;
    return getProviderStores(integration.provider).find((s) => s.id === integration.storeId)?.label;
  }, [integration?.provider, integration?.storeId]);

  function handleProviderChange(provider: GroceryProviderId) {
    setSelectedProvider(provider);
    const nextStores = getProviderStores(provider);
    setSelectedStore(nextStores[nextStores.length - 1]?.id ?? "");
  }

  function isProviderConnected(providerId: GroceryProviderId) {
    if (integration?.provider !== providerId) return false;
    return connected || manual;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        {GROCERY_PROVIDER_LIST.map((provider) => {
          const selected = selectedProvider === provider.id;
          const providerConnected = isProviderConnected(provider.id);

          return (
            <button
              key={provider.id}
              type="button"
              disabled={disabled || pending}
              onClick={() => handleProviderChange(provider.id)}
              className={`maison-provider-card w-full flex items-center gap-3.5 text-left rounded-2xl px-4 py-3.5 transition-all ring-1 ${
                selected
                  ? "bg-sage-soft ring-sage/25 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
                  : "bg-paper ring-black/[0.06] text-ink hover:ring-black/10"
              }`}
            >
              <div
                className="size-14 shrink-0 rounded-xl grid place-items-center overflow-hidden p-2"
                style={{ backgroundColor: provider.logoBg }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local brand SVG marks */}
                <img
                  src={provider.logoPath}
                  alt=""
                  aria-hidden
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 min-w-0">
                <span
                  className={`block leading-tight ${
                    selected ? "font-serif text-xl text-sage" : "text-sm font-medium text-ink"
                  }`}
                >
                  {provider.label}
                </span>
                <span
                  className={`text-xs block mt-0.5 leading-snug ${
                    selected ? "text-sage/70" : "text-ash"
                  }`}
                >
                  {provider.description}
                </span>
              </div>

              {providerConnected ? (
                <span
                  className="size-7 shrink-0 rounded-full bg-sage text-cream grid place-items-center"
                  title="Connecté"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              ) : selected ? (
                <span className="size-2.5 shrink-0 rounded-full bg-sage" aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>

      {isActiveProvider && (connected || manual) ? (
        <div className="rounded-2xl bg-sage-soft ring-1 ring-sage/20 overflow-hidden animate-rise">
          <div
            className="h-1 w-full"
            style={{ backgroundColor: config.brandColor }}
            aria-hidden
          />
          <div className="p-4 flex items-start gap-3">
            <span className="size-9 shrink-0 rounded-full bg-sage text-cream grid place-items-center mt-0.5">
              <Check className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-sage truncate">
                {integration?.accountLabel ?? "Connecté"}
              </p>
              {connectedStoreLabel ? (
                <p className="text-xs text-sage/80 mt-0.5 truncate">{connectedStoreLabel}</p>
              ) : null}
              <p className="text-xs text-sage/60 mt-1">
                {manual ? "Mode manuel actif" : `${config.label} · synchronisé`}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {showConnectForm ? (
        <div className="rounded-2xl bg-paper ring-1 ring-black/[0.04] overflow-hidden animate-rise shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="h-1 w-full" style={{ backgroundColor: config.brandColor }} aria-hidden />
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 pb-1">
              <div
                className="size-10 shrink-0 rounded-xl grid place-items-center overflow-hidden p-1.5"
                style={{ backgroundColor: config.logoBg }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local brand SVG marks */}
                <img
                  src={config.logoPath}
                  alt=""
                  aria-hidden
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="font-serif text-lg text-ink leading-tight">{config.label}</p>
                <p className="text-xs text-ash mt-0.5">Choisissez votre magasin et connectez-vous</p>
              </div>
            </div>

            {(config.supportsMock || config.supportsOAuthRedirect) ? (
              <div className="space-y-2">
                <label className="text-xs font-medium text-ink/70 flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5" />
                  Magasin Drive
                </label>
                <select
                  className="maison-input"
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  disabled={disabled || pending}
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {config.supportsOAuthRedirect ? (
              <button
                type="button"
                disabled={disabled || pending}
                onClick={() => {
                  const params = new URLSearchParams({
                    provider: selectedProvider,
                    ...(selectedStore ? { storeId: selectedStore } : {}),
                  });
                  window.location.href = `/api/maison/grocery/oauth/start?${params}`;
                }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-medium text-white disabled:opacity-50 active:scale-[0.99] transition-transform"
                style={{ backgroundColor: config.brandColor }}
              >
                <ExternalLink className="h-4 w-4" />
                Se connecter avec {config.shortLabel}
              </button>
            ) : null}

            {config.supportsMock ? (
              <button
                type="button"
                disabled={disabled || pending}
                onClick={() =>
                  startTransition(() => onConnect(selectedProvider, "mock", selectedStore))
                }
                className="w-full flex items-center justify-center gap-2 bg-ink text-cream py-4 rounded-2xl text-sm font-medium disabled:opacity-50 active:scale-[0.99] transition-transform"
              >
                {pending ? (
                  <span className="maison-spinner" />
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    Connecter compte (simulation)
                  </>
                )}
              </button>
            ) : null}

            {config.supportsManual ? (
              <button
                type="button"
                disabled={disabled || pending}
                onClick={() => startTransition(() => onConnect(selectedProvider, "manual"))}
                className={`w-full py-3.5 rounded-2xl text-sm transition-all ${
                  config.supportsMock
                    ? "text-ash ring-1 ring-black/[0.06] hover:ring-black/12"
                    : "flex items-center justify-center gap-2 bg-ink text-cream font-medium disabled:opacity-50 active:scale-[0.99]"
                }`}
              >
                {config.supportsMock ? "Mode manuel (démo)" : "Continuer en mode manuel"}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <p className="text-[10px] text-center text-ash leading-relaxed px-2">
        La connexion ouvre la page officielle {config.label}. Après connexion, vous serez
        redirigé vers Maison pour confirmer le lien. L&apos;export JSON reste disponible sans
        compte connecté.
      </p>
    </div>
  );
}
