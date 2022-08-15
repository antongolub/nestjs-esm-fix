import {suite} from 'uvu'
import * as assert from 'uvu/assert'
import {temporaryDirectory} from 'tempy'
import fse from 'fs-extra'
import path from 'path'
import {fix} from '../../main/js/index.js'

const test = suite('index')

test('patches contents by required opts', async () => {
  const temp = temporaryDirectory()
  const before = ``
  const after = ``

  await fse.outputFile(path.join(temp, 'index.js'), before)
  await fix({cwd: temp})
  const result = await fse.readFile(path.join(temp, 'index.js'), {encoding: 'utf8'})

  assert.fixture(result, after)
})

test.run()
