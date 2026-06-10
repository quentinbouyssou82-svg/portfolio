import { McnMobileNav } from "@/components/mon-cerveau-numerique/mcn-mobile-nav";
import { McnSidebar } from "@/components/mon-cerveau-numerique/mcn-sidebar";

export default function McnDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <McnSidebar />
      <main className="min-w-0 flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>
      <McnMobileNav />
    </div>
  );
}
