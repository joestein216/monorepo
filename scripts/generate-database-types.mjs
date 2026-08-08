import { spawnSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import { resolve } from "node:path"

const projectId = process.env.SUPABASE_PROJECT_ID

if (!projectId) {
  console.error("SUPABASE_PROJECT_ID is required to generate database types.")
  process.exit(1)
}

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm"
const result = spawnSync(
  pnpmCommand,
  ["exec", "supabase", "gen", "types", "typescript", "--project-id", projectId],
  { encoding: "utf8" },
)

if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}

if (result.status !== 0) {
  process.stderr.write(result.stderr)
  process.exit(result.status ?? 1)
}

writeFileSync(resolve("packages/database/database.types.ts"), result.stdout)
console.log("Updated packages/database/database.types.ts")
