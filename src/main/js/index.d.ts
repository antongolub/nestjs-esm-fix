export function fix(opts: {
  target: string
  cwd?: string
  openapiComplexTypes?: boolean
  openapiMeta?: boolean
  openapiVar?: boolean
  dirnameVar?: boolean
  importify?: boolean
  requireMain?: boolean
  redocTpl?: boolean
}): Promise<void>
