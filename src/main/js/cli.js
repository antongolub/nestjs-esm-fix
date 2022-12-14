#!/usr/bin/env node

import minimist from 'minimist'
import { createRequire } from 'node:module'
import { fix } from './index.js'

const densify = (obj) => (
  Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]),
  obj
)
const camelize = (s) => s.replace(/-./g, (x) => x[1].toUpperCase())
const normalizeFlags = (flags = {}) =>
  Object.entries(flags).reduce((acc, [k, v]) => {
    if (k.startsWith('no-')) {
      v = !v
      k = k.slice(3)
    }

    return { ...acc, [camelize(k)]: v }
  }, {})
const _argv = minimist(process.argv.slice(2))
const argv = normalizeFlags(_argv)

if (argv.help || argv.h) {
  console.log(`
  Usage:
    nestjs-esm-fix <directory> [options]
    
  Options:
    --openapi-complex-types     Simplify __metadata("design:type" declarations. Defaults to true, set 'no-' prefix to disable.
    --openapi-meta      Restore static OPENAPI_METADATA_FACTORY if missing. (true)
    --openapi-var       Inject openapi variable. (true)
    --dirname-var       Inject __dirname variable polyfill. (true)
    --importify         Replace 'require' with 'import' API if possible. (true)
    --require-main      Inject 'main' field for 'require' API polyfill. (true)
    --redoc-tpl         Inject 'redoc.hbs' templates.
    --cwd -C            Working directory. Defaults to process.cwd()
    --target            Pattern to match files to fix. Defaults to '**/*'
    --help -h           Show help
    --version -v        Show version

  Examples:
    nestjs-esm-fix target/es6
    nestjs-esm-fix target/**/*.js --no-importify
`)
  process.exit(0)
} else if (argv.v || argv.version) {
  console.log(createRequire(import.meta.url)('../../../package.json').version)
  process.exit(0)
} else {
  await fix(
    densify({
      ...argv,
      cwd: argv.cwd || argv.C,
      target: argv.target || argv._[0],
    }),
  )
}
