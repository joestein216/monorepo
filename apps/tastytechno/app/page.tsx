import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { supabase } from "@repo/database"

export default async function HomePage() {
  // Test out your shared Supabase client type safety instantly!
  // const { data } = await supabase.from('your_table').select('*')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm flex flex-col gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Tasty Techno</h1>
        <p className="text-muted-foreground text-lg">
          Your shared monorepo architectural stack is officially connected.
        </p>
        <div className="flex gap-4">
          <Button>Shared UI Component</Button>
          <Link href="/studio" className="underline text-sm block mt-2 text-muted-foreground hover:text-primary">
            Open Sanity Admin Studio →
          </Link>
        </div>
      </div>
    </main>
  )
}
