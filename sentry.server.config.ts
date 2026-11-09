import * as Sentry from "@sentry/node";
import { scrubObject } from "./lib/margeo/security/pii-scrub";

const dsn = process.env.SENTRY_DSN?.trim();

const SENSITIVE_EXTRA_KEYS = [
  "authorization",
  "cookie",
  "password",
  "token",
  "email",
  "address",
  "lat",
  "lng",
  "image",
  "screenshot",
];

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 0,
  sendDefaultPii: false,
  beforeSend(event) {
    if (event.user) {
      event.user = {
        id: event.user.id,
        // jamais email / ip / username
      };
    }
    if (event.extra) {
      event.extra = scrubObject(event.extra as Record<string, unknown>);
    }
    if (event.request) {
      delete event.request.cookies;
      delete event.request.data;
      if (event.request.headers) {
        for (const key of Object.keys(event.request.headers)) {
          if (SENSITIVE_EXTRA_KEYS.some((s) => key.toLowerCase().includes(s))) {
            delete event.request.headers[key];
          }
        }
      }
    }
    return event;
  },
});

export { Sentry };
