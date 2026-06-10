import type { WaitlistEntry } from "@/lib/waitlist-types";
import { buildWaitlistRow } from "@/lib/waitlist-row";

const NOTION_VERSION = "2022-06-28";
const DEFAULT_DATABASE_ID = "35356780-a3d8-40f2-afdf-667543feb15a";

function getNotionConfig() {
  const token = process.env.NOTION_TOKEN?.trim();
  const databaseId =
    process.env.NOTION_WAITLIST_DATABASE_ID?.trim() || DEFAULT_DATABASE_ID;
  const direct =
    process.env.NOTION_DIRECT_SYNC !== "false" &&
    process.env.NOTION_DIRECT_SYNC !== "0";

  if (!token || !direct) {
    return { enabled: false as const };
  }

  return { enabled: true as const, token, databaseId };
}

function richText(content: string) {
  return [{ type: "text" as const, text: { content: content.slice(0, 2000) } }];
}

function buildNotionProperties(entry: WaitlistEntry) {
  const row = buildWaitlistRow(entry);
  const props: Record<string, unknown> = {
    Nom: {
      title: richText(row.name || row.email.split("@")[0] || "Inscription"),
    },
    Email: { email: row.email },
    Priorité: { select: { name: "Moyenne" } },
  };

  if (row.company) {
    props.Entreprise = { rich_text: richText(row.company) };
  }

  if (row.website) {
    let url = row.website;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    props["Site actuel"] = { url };
  }

  if (row.need) {
    props.Besoin = { rich_text: richText(row.need) };
  }

  return props;
}

async function notionFetch(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

async function findPageByEmail(
  token: string,
  databaseId: string,
  email: string,
): Promise<string | null> {
  const res = await notionFetch(`/databases/${databaseId}/query`, token, {
    method: "POST",
    body: JSON.stringify({
      page_size: 1,
      filter: {
        property: "Email",
        email: { equals: email.trim().toLowerCase() },
      },
    }),
  });

  const data = (await res.json()) as { results?: { id: string }[]; message?: string };

  if (!res.ok) {
    console.error("[notion-waitlist] query failed:", res.status, data);
    return null;
  }

  return data.results?.[0]?.id ?? null;
}

export type NotionSyncResult =
  | { ok: true; pageId: string; updated: boolean }
  | { ok: false; skipped: true }
  | { ok: false; message: string };

export async function syncWaitlistToNotion(
  entry: WaitlistEntry,
): Promise<NotionSyncResult> {
  const config = getNotionConfig();
  if (!config.enabled) {
    console.info("[notion-waitlist] sync désactivé (NOTION_TOKEN ou NOTION_DIRECT_SYNC=false)");
    return { ok: false, skipped: true };
  }

  const email = entry.email.trim().toLowerCase();
  const properties = buildNotionProperties({ ...entry, email });

  console.info(
    "[notion-waitlist] envoi:",
    JSON.stringify({
      email,
      fields: {
        name: entry.name,
        company: entry.company,
        website: entry.website,
        need: entry.need,
      },
    }),
  );

  try {
    const existingId = await findPageByEmail(
      config.token,
      config.databaseId,
      email,
    );

    if (existingId) {
      const res = await notionFetch(`/pages/${existingId}`, config.token, {
        method: "PATCH",
        body: JSON.stringify({ properties }),
      });
      const data = (await res.json()) as { id?: string; message?: string };
      if (!res.ok) {
        console.error("[notion-waitlist] update failed:", res.status, data);
        return { ok: false, message: data.message ?? "Notion update failed" };
      }
      console.info("[notion-waitlist] update OK", { pageId: existingId, email });
      return { ok: true, pageId: data.id ?? existingId, updated: true };
    }

    const res = await notionFetch("/pages", config.token, {
      method: "POST",
      body: JSON.stringify({
        parent: { database_id: config.databaseId },
        properties,
      }),
    });

    const data = (await res.json()) as { id?: string; message?: string };
    if (!res.ok) {
      console.error("[notion-waitlist] create failed:", res.status, data);
      return { ok: false, message: data.message ?? "Notion create failed" };
    }

    console.info("[notion-waitlist] create OK", { pageId: data.id, email });
    return { ok: true, pageId: data.id ?? "", updated: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Notion sync error";
    console.error("[notion-waitlist] exception:", err);
    return { ok: false, message };
  }
}
