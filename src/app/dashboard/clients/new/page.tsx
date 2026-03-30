import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { NewClientForm } from "@/components/new-client-form";

export default async function NewClientPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <div className="flex-1 flex flex-col pb-20">
      <header className="px-4 py-3 border-b border-border bg-card">
        <h1 className="text-xl font-bold">New Client</h1>
      </header>
      <main className="flex-1 px-4 py-6">
        <NewClientForm />
      </main>
    </div>
  );
}
