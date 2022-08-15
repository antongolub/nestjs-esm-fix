import { globby } from 'globby'
import fse from 'fs-extra'

export const defaults = {
  openapiVar: true,
  openapiTypeRef: true,
}

export const fix = async ({ target, cwd = process.cwd(), ..._opts }) => {
  if (!target) {
    throw new Error('target is required')
  }

  const opts = { ...defaults, ..._opts }
  const pattern = target.includes('*') ? target : `${target}/**/*`
  const files = await globby(pattern, { onlyFiles: true, absolute: true, cwd })

  await Promise.all(files.map((file) => patch(file, opts)))

  return ''
}

export const patch = async (file, opts) => {
  const contents = await fse.readFile(file, { encoding: 'utf8' })
  let _contents = contents

  if (opts.openapiVar) {
    _contents = patchOpenapiRef(_contents)
  }

  if (opts.openapiTypeRef) {
    _contents = patchClassRequire(_contents)
  }

  if (_contents !== contents) {
    await fse.writeFile(file, _contents)
  }
}

const patchOpenapiRef = (contents) => {
  if (contents.includes(' openapi.') && !contents.includes('import openapi ')) {
    return `import openapi from "@nestjs/swagger";
${contents}`
  }

  return contents
}

const patchClassRequire = (contents) => {
  const pattern = / require\("([^"]+)"\)\.(\w+) /gi
  const aliases = []
  const _contents = contents.replaceAll(pattern, (_, $1, $2) => {
    const alias = `__${$2}`
    aliases.push({ source: $1, alias, ref: $2 })
    return alias
  })

  if (aliases.length > 0) {
    return (
      aliases
        .map(
          ({ source, alias, ref }) =>
            `import { ${ref} as ${alias} } from '${source}';\n`,
        )
        .join('') + _contents
    )
  }

  return contents
}
