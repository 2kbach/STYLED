import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/sign-in-button";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-sm">
        <h1 className="text-4xl font-bold tracking-tight">STYLED</h1>
        <p className="text-muted text-lg">
          Hair color formulation & tracking
        </p>
        <SignInButton />
        <p className="text-xs text-muted">v0.1.0</p>
      </div>
    </main>
  );
}
