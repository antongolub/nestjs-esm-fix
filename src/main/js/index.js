import { globby } from 'globby'
import fse from 'fs-extra'

export const defaults = {
  openapiVar: true,
  importify: true,
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
  const _contents = patchContents(contents, opts)

  if (_contents !== contents) {
    await fse.writeFile(file, _contents)
  }
}

export const patchContents = async (contents, opts = {}) => {
  let _contents = contents

  if (opts.openapiVar) {
    _contents = patchOpenapiVariable(_contents)
  }

  if (opts.importClasses || opt.importify) {
    _contents = patchClassRequire(_contents)
  }

  if (opts.importBuiltins || opt.importify) {
    _contents = patchBuiltinsRequire(_contents)
  }

  if (opts.openapiMetadataFactory) {
    _contents = patchOpenapiMetadataFactory(_contents)
  }

  return _contents
}

const patchOpenapiMetadataFactory = (contents) => {
  const decoratorsRe = /__decorate([^;]+);/g
  const decorators = []

  let m
  do {
    m = decoratorsRe.exec(contents)
    if (m) {
      decorators.push(m[1])
    }
  } while (m)

  const metadata = decorators.reduce((m, block) => {
    const lines = block.split('\n')
    const [, className, fieldName] = lines.pop().match(/(\w+)\.prototype, "(\w+)"/)
    const entry = { className, fieldName }
    lines.forEach(l => {
      if (l.includes('__metadata("design:type')) {
        entry.type = l.slice(0, -1).split('__metadata("design:type",')[1]
      }

      if (l.includes('IsOptional')) {
        entry.isOptional = true
      }

      if (l.includes('IsEnum')) {
        entry.isEnum = true
      }
    })

    const fieldset = m[className] || (m[className] = [])
    fieldset.push(entry)

    return m
  }, {})

  const declareField = ({fieldName, type, isOptional, isEnum}) =>
    `${fieldName}: { ${isOptional ? 'required: false, ' : ''} ${isEnum ? 'enum:' : 'type: () =>'} ${type} }`

  return contents.replaceAll(/var (\w+) = class \{\n};/g, ($0, $1) => {
    const entry = metadata[$1]
    if (!entry) {
      return $1
    }

    return `var ${$1} = class {
    static _OPENAPI_METADATA_FACTORY() {
        return { ${entry.map(declareField).join(', ')} }
    }
};`
  })
}

const patchOpenapiVariable = (contents) => {
  if (contents.includes(' openapi.') && !contents.includes('import openapi ')) {
    return `import openapi from "@nestjs/swagger";
${contents}`
  }

  return contents
}

const patchClassRequire = (contents) => {
  const pattern = /require\("([^"]+)"\)\.(\w+)/gi
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

// Adapted from ...
const patchBuiltinsRequire = () => {

}
