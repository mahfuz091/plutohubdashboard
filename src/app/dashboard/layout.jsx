import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";

import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { canAccessDashboard } from "@/lib/access";

export default async function Page({ children }) {
  const session = await auth();
  if (!session || !canAccessDashboard(session.user)) {
    redirect("/");
  }

  return (
    <SidebarProvider className=' '>
      <AppSidebar variant='inset' session={session} />
      <SidebarInset>
        <SiteHeader />
        <div className='-mt-2'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
