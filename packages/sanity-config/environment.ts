export function requireEnvironmentVariable(
  name: string,
  value: string | undefined,
): string {
  const normalizedValue = value?.trim()

  if (!normalizedValue) {
    throw new Error(`${name} is required.`)
  }

  return normalizedValue
}
