export const fix = async ({target, cwd = process.cwd()}) => {
  if (!target) {
    throw new Error('target is required')
  }

  return ''
}
