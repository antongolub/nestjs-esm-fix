import { globby } from 'globby'
import fse from 'fs-extra'
import { resolve } from 'import-meta-resolve'
import { fileURLToPath } from 'node:url'

export const defaults = {
  openapiVar: true,
  dirnameVar: true,
  importify: true,
  requireMain: true,
  redocTpl: true,
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
  const _contents = await patchContents(contents, opts)

  if (_contents !== contents) {
    await fse.writeFile(file, _contents)
  }
}

export const patchContents = async (contents, opts = {}) => {
  let _contents = contents

  if (opts.openapiVar) {
    _contents = patchOpenapiVariable(_contents)
  }

  if (opts.importClasses || opts.importify) {
    _contents = patchClassRequire(_contents)
  }

  if (opts.importBuiltins || opts.importify) {
    _contents = patchBuiltinsRequire(_contents)
  }

  if (opts.dirnameVar) {
    _contents = patchDirnameVar(_contents)
  }

  if (opts.openapiMetadataFactory) {
    _contents = patchOpenapiMetadataFactory(_contents)
  }

  if (opts.requireMain) {
    _contents = patchRequireMain(_contents)
  }

  if (opts.redocTpl) {
    _contents = await patchRedocTemplate(_contents)
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
    const [, className, fieldName] = lines
      .pop()
      .match(/(\w+)\.prototype, "(\w+)"/)
    const entry = { className, fieldName }
    lines.forEach((l) => {
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

  const declareField = ({ fieldName, type, isOptional, isEnum }) =>
    `${fieldName}: { ${isOptional ? 'required: false, ' : ''} ${
      isEnum ? 'enum:' : 'type: () =>'
    } ${type} }`

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
  const pattern = /\b(?:__)?require\("([^"]+)"\)\.(\w+)/gi
  const aliases = new Map()
  const _contents = contents.replaceAll(pattern, (_, $1, $2) => {
    const key = `${$1}#${$2}`
    if (!aliases.has(key)) {
      const alias = `${$2}__${Math.random().toString(36).slice(2)}`
      aliases.set(key, { source: $1, alias, ref: $2 })
    }

    return aliases.get(key).alias
  })

  if (aliases.size > 0) {
    return (
      [...aliases.values()]
        .map(
          ({ source, alias, ref }) =>
            `import { ${ref} as ${alias} } from '${source}';\n`,
        )
        .join('') + _contents
    )
  }

  return contents
}

const patchDirnameVar = (contents) => `import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = __import_PATH.dirname(__filename)
${contents}`

// Adapted from https://github.com/evanw/esbuild/issues/1921#issuecomment-1010490128
const patchBuiltinsRequire = (contents) => {
  const regexp =
    /\b__require\("(_http_agent|_http_client|_http_common|_http_incoming|_http_outgoing|_http_server|_stream_duplex|_stream_passthrough|_stream_readable|_stream_transform|_stream_wrap|_stream_writable|_tls_common|_tls_wrap|assert|async_hooks|buffer|child_process|cluster|console|constants|crypto|dgram|diagnostics_channel|dns|domain|events|fs|http|http2|https|inspector|module|net|os|path|perf_hooks|process|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|trace_events|tty|url|util|v8|vm|wasi|worker_threads|zlib)"\)/gm
  const modules = new Map()
  let imports = ''

  const _contents = contents.replace(regexp, function (req, mod) {
    const id = '__import_' + mod.toUpperCase()
    if (!modules.has(mod)) {
      imports += `import ${id} from '${mod}'\n`
    }
    modules.set(mod, id)
    return id
  })

  return imports + _contents
}

const patchRequireMain = (contents) =>
  contents.replace(
    /var requireFunction =.+/,
    (decl) => `${decl}
requireFunction.main = {
  filename: __filename
};
`,
  )

const patchRedocTemplate = async (contents) => {
  const tplPath = fileURLToPath(
    await resolve('nestjs-redoc/views/redoc.handlebars', import.meta.url),
  )
  const tpl = await fse.readFile(tplPath, 'utf8')

  return contents.replace(
    'const redocHTML = yield hbs.render(redocFilePath, renderData);',
    `const redocHTML = yield hbs._renderTemplate(\`${tpl}\`, renderData);`,
  )
}
