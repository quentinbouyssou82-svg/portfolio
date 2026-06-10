export type McnProfile = {
  id: string;
  display_name: string | null;
  onboarding_completed: boolean;
  priorities?: string[];
  created_at: string;
};

export type McnTask = {
  id: string;
  user_id: string;
  title: string;
  done: boolean;
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
};

export type McnDocument = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  created_at: string;
};

export type McnDashboardData = {
  profile: McnProfile;
  tasks: McnTask[];
  documents: McnDocument[];
  stats: {
    totalDocuments: number;
    pendingTasks: number;
    completedTasks: number;
    categories: number;
  };
};
