import { suite } from 'uvu'
import * as assert from 'uvu/assert'
import { temporaryDirectory } from 'tempy'
import fse from 'fs-extra'
import path from 'node:path'

const test = suite('cli')
const argv = process.argv
const exit = process.exit

process.exit = () => {}

test('CLI patches contents by required opts', async () => {
  const temp = temporaryDirectory()
  const before = `
 openapi.ApiResponse({ status: 200, type: String })`
  const after = `import { fileURLToPath } from 'node:url'
import { dirname as __pathDirname} from 'node:path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = __pathDirname(__filename)
import openapi from "@nestjs/swagger";

 openapi.ApiResponse({ status: 200, type: String })`

  await fse.outputFile(path.join(temp, 'index.js'), before)

  process.argv = [...argv.slice(0, 2), '.', '--cwd', temp, '--no-importify']
  await import('../../main/js/cli.js#custom')
  const result = await fse.readFile(path.join(temp, 'index.js'), {
    encoding: 'utf8',
  })

  assert.fixture(result, after)
})

test('CLI -h', async () => {
  process.argv = [...argv.slice(0, 2), '--help']
  await import('../../main/js/cli.js#help')
})

test('CLI -v', async () => {
  process.argv = [...argv.slice(0, 2), '-v']
  await import('../../main/js/cli.js#version')
})

test.run()
