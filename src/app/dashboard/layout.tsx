import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DashboardHeader } from "@/components/dashboard-header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const cookieStore = await cookies();
  const isTestMode = cookieStore.get("test_mode")?.value === "1";

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-50">
        <DashboardHeader user={session.user} isTestMode={isTestMode} />
      </div>
      {children}
    </div>
  );
}
