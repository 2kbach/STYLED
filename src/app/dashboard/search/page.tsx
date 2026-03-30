import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SearchView } from "@/components/search-view";
import { BottomNav } from "@/components/bottom-nav";

export default async function SearchPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <div className="flex-1 flex flex-col pb-20">
      <header className="px-4 py-3 border-b border-border bg-card">
        <h1 className="text-xl font-bold">Search</h1>
      </header>
      <main className="flex-1 px-4 py-4">
        <SearchView />
      </main>
      <BottomNav />
    </div>
  );
}
