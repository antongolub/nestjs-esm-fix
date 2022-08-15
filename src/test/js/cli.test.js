import {suite} from 'uvu'
import * as assert from 'uvu/assert'
import {temporaryDirectory} from 'tempy'
import fse from 'fs-extra'
import path from 'node:path'
import {fix} from '../../main/js/index.js'

const test = suite('index')
const argv = process.argv
const exit = process.exit

process.exit = () => {}

test('CLI patches contents by required opts', async () => {
  const temp = temporaryDirectory()
  const before = ``
  const after = ``

  await fse.outputFile(path.join(temp, 'index.js'), before)

  process.argv = [...argv.slice(0, 2), '**/*', '--cwd', temp, '--no-openapi-type-ref=true']
  await import('../../main/js/cli.js#default')
  const result = await fse.readFile(path.join(temp, 'index.js'), {encoding: 'utf8'})

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
