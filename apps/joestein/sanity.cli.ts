import {
  createCliConfig,
  requireEnvironmentVariable,
} from "@repo/sanity-config/cli"

const projectId = requireEnvironmentVariable(
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
)
const dataset = requireEnvironmentVariable(
  "NEXT_PUBLIC_SANITY_DATASET",
  process.env.NEXT_PUBLIC_SANITY_DATASET,
)

export default createCliConfig({ projectId, dataset })
