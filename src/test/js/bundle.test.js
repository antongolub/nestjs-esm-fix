import { suite } from 'uvu'
import * as assert from 'uvu/assert'
import { fix } from '../../../target/es6/index.js'

const test = suite('bundle')

test('has proper export', () => {
  assert.instance(fix, Function)
})

test.run()
