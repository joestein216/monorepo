import { defineCliConfig } from "sanity/cli"

export { requireEnvironmentVariable } from "./environment"

export type CliConfigOptions = {
  projectId: string
  dataset: string
}

export function createCliConfig({ projectId, dataset }: CliConfigOptions) {
  return defineCliConfig({
    api: {
      projectId,
      dataset,
    },
  })
}
