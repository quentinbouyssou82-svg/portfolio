"use client";

import { useCallback, useEffect, useState } from "react";
import {
  buildDashboardData,
  defaultDocuments,
  defaultProfile,
  defaultTasks,
  DEMO_USER_ID,
} from "@/lib/mon-cerveau-numerique/mock-data";
import type {
  McnDashboardData,
  McnDocument,
  McnProfile,
  McnTask,
} from "@/lib/mon-cerveau-numerique/types";

const STORAGE_KEY = "mcn-demo-store";

type McnStore = {
  profile: McnProfile;
  tasks: McnTask[];
  documents: McnDocument[];
};

function loadStore(): McnStore {
  if (typeof window === "undefined") {
    return { profile: defaultProfile, tasks: defaultTasks, documents: defaultDocuments };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { profile: defaultProfile, tasks: defaultTasks, documents: defaultDocuments };
    }
    return JSON.parse(raw) as McnStore;
  } catch {
    return { profile: defaultProfile, tasks: defaultTasks, documents: defaultDocuments };
  }
}

function saveStore(store: McnStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function useMcnStore() {
  const [store, setStore] = useState<McnStore>(() => loadStore());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStore(loadStore());
    setReady(true);
  }, []);

  const persist = useCallback((next: McnStore) => {
    setStore(next);
    saveStore(next);
  }, []);

  const data: McnDashboardData = buildDashboardData(
    store.profile,
    store.tasks,
    store.documents,
  );

  const addTask = useCallback(
    (title: string) => {
      const task: McnTask = {
        id: newId("task"),
        user_id: DEMO_USER_ID,
        title: title.trim(),
        done: false,
        priority: "medium",
        due_date: null,
        created_at: new Date().toISOString(),
      };
      persist({ ...store, tasks: [task, ...store.tasks] });
    },
    [persist, store],
  );

  const toggleTask = useCallback(
    (taskId: string, done: boolean) => {
      persist({
        ...store,
        tasks: store.tasks.map((t) => (t.id === taskId ? { ...t, done } : t)),
      });
    },
    [persist, store],
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      persist({ ...store, tasks: store.tasks.filter((t) => t.id !== taskId) });
    },
    [persist, store],
  );

  const addDocument = useCallback(
    (name: string, category: string) => {
      const doc: McnDocument = {
        id: newId("doc"),
        user_id: DEMO_USER_ID,
        name: name.trim(),
        category: category || "Autre",
        created_at: new Date().toISOString(),
      };
      persist({ ...store, documents: [doc, ...store.documents] });
    },
    [persist, store],
  );

  const deleteDocument = useCallback(
    (docId: string) => {
      persist({ ...store, documents: store.documents.filter((d) => d.id !== docId) });
    },
    [persist, store],
  );

  const updateProfile = useCallback(
    (patch: Partial<Pick<McnProfile, "display_name" | "onboarding_completed" | "priorities">>) => {
      persist({ ...store, profile: { ...store.profile, ...patch } });
    },
    [persist, store],
  );

  const resetStore = useCallback(() => {
    const fresh = { profile: defaultProfile, tasks: defaultTasks, documents: defaultDocuments };
    persist(fresh);
  }, [persist]);

  return {
    ready,
    data,
    addTask,
    toggleTask,
    deleteTask,
    addDocument,
    deleteDocument,
    updateProfile,
    resetStore,
  };
}
