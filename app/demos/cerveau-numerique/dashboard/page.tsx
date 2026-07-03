"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TopNav } from "../_components/dashboard/top-nav";
import { HomeView } from "../_components/dashboard/views/home-view";
import { MailsView } from "../_components/dashboard/views/mails-view";
import { TasksView } from "../_components/dashboard/views/tasks-view";
import { AgendaView } from "../_components/dashboard/views/agenda-view";
import { DocumentsView } from "../_components/dashboard/views/documents-view";
import { SearchView } from "../_components/dashboard/views/search-view";
import { ChatView } from "../_components/dashboard/views/chat-view";
import { SuggestionsView } from "../_components/dashboard/views/suggestions-view";
import { SettingsView } from "../_components/dashboard/views/settings-view";
import type { ViewId } from "../_lib/dashboard-data";

const views: Record<ViewId, React.ComponentType> = {
  home: HomeView,
  mails: MailsView,
  tasks: TasksView,
  agenda: AgendaView,
  documents: DocumentsView,
  search: SearchView,
  chat: ChatView,
  suggestions: SuggestionsView,
  settings: SettingsView,
};

export default function DashboardPage() {
  const [view, setView] = useState<ViewId>("home");
  const ActiveView = views[view];

  return (
    <div className="min-h-screen">
      <TopNav active={view} onNavigate={setView} />
      <AnimatePresence mode="wait">
        <motion.main
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <ActiveView />
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
