import {suite} from 'uvu'
import * as assert from 'uvu/assert'
import {temporaryDirectory} from 'tempy'
import fse from 'fs-extra'
import path from 'node:path'
import {fix} from '../../main/js/index.js'

const test = suite('index')

test('fix() patches contents by required opts', async () => {
  const temp = temporaryDirectory()
  const before = `
export class CspReportDto {
  static _OPENAPI_METADATA_FACTORY() {
    return { timestamp: { required: false, type: () => Object }, 'csp-report': { required: true, type: () => require("./csp.dto.js").CspReport } };
  }
}
__decorate([
  Post('event-unsafe-batch'),
  HttpCode(200),
  openapi.ApiResponse({ status: 200, type: String }),
  __param(0, Body()),
  __param(1, Req()),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [Object, Object]),
  __metadata("design:returntype", Promise)
], EventUnsafeController.prototype, "logEventBatch", null);
`
  const after = `import { CspReport as __CspReport } from './csp.dto.js';
import openapi from "@nestjs/swagger";

export class CspReportDto {
  static _OPENAPI_METADATA_FACTORY() {
    return { timestamp: { required: false, type: () => Object }, 'csp-report': { required: true, type: () =>__CspReport} };
  }
}
__decorate([
  Post('event-unsafe-batch'),
  HttpCode(200),
  openapi.ApiResponse({ status: 200, type: String }),
  __param(0, Body()),
  __param(1, Req()),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [Object, Object]),
  __metadata("design:returntype", Promise)
], EventUnsafeController.prototype, "logEventBatch", null);
`

  await fse.outputFile(path.join(temp, 'index.js'), before)
  await fix({cwd: temp, target: '**/*'})
  const result = await fse.readFile(path.join(temp, 'index.js'), {encoding: 'utf8'})

  assert.fixture(result, after)
})

test('fix() returns contents as is if no occurrences found', async () => {
  const temp = temporaryDirectory()
  const before = `foo`
  const after = `foo`

  await fse.outputFile(path.join(temp, 'index.js'), before)
  await fix({cwd: temp, target: '**/*'})
  const result = await fse.readFile(path.join(temp, 'index.js'), {encoding: 'utf8'})

  assert.fixture(result, after)
})

test('fix() asserts arguments', async () => {
  try {
    await fix({})
    assert.unreachable('should have thrown')

  } catch (err) {
    assert.instance(err, Error)
    assert.match(err.message, 'target is required')
  }
})

test.run()
