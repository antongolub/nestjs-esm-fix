import { suite } from 'uvu'
import * as assert from 'uvu/assert'
import { temporaryDirectory } from 'tempy'
import fse from 'fs-extra'
import path from 'node:path'
import { fix, patchContents } from '../../main/js/index.js'

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
    return { timestamp: { required: false, type: () => Object }, 'csp-report': { required: true, type: () => __CspReport } };
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
  await fix({ cwd: temp, target: '**/*' })
  const result = await fse.readFile(path.join(temp, 'index.js'), {
    encoding: 'utf8',
  })

  assert.fixture(result, after)
})

test('fix() returns contents as is if no occurrences found', async () => {
  const temp = temporaryDirectory()
  const before = `foo`
  const after = `foo`

  await fse.outputFile(path.join(temp, 'index.js'), before)
  await fix({ cwd: temp, target: '**/*' })
  const result = await fse.readFile(path.join(temp, 'index.js'), {
    encoding: 'utf8',
  })

  assert.fixture(result, after)
})

test('fix() asserts arguments', async () => {
  try {
    await fix({})
  } catch (err) {
    assert.instance(err, Error)
    assert.match(err.message, 'target is required')
  }
})

test.only('patchContents() restores openapi metadata', async () => {
  const input = `var Meta = class {
};
__name(Meta, "Meta");
__decorate([
  (0, import_class_validator2.IsOptional)(),
  (0, import_class_validator2.IsString)(),
  __metadata("design:type", String)
], Meta.prototype, "appName", void 0);
__decorate([
  (0, import_class_validator2.IsOptional)(),
  (0, import_class_validator2.IsString)(),
  __metadata("design:type", String)
], Meta.prototype, "appHost", void 0);
__decorate([
  (0, import_class_validator2.IsOptional)(),
  (0, import_class_validator2.IsString)(),
  __metadata("design:type", String)
], Meta.prototype, "appVersion", void 0);
__decorate([
  (0, import_class_validator2.IsOptional)(),
  (0, import_class_validator2.IsString)(),
  __metadata("design:type", String)
], Meta.prototype, "appNamespace", void 0);
__decorate([
  (0, import_class_validator2.IsOptional)(),
  (0, import_class_validator2.IsObject)(),
  __metadata("design:type", typeof (_a3 = typeof Record !== "undefined" && Record) === "function" ? _a3 : Object)
], Meta.prototype, "appConfig", void 0);
__decorate([
  (0, import_class_validator2.IsOptional)(),
  (0, import_class_validator2.IsObject)(),
  __metadata("design:type", typeof (_b3 = typeof Record !== "undefined" && Record) === "function" ? _b3 : Object)
], Meta.prototype, "deviceInfo", void 0);
__decorate([
  (0, import_class_validator2.IsOptional)(),
  (0, import_class_validator2.IsString)(),
  __metadata("design:type", String)
], Meta.prototype, "userAgent", void 0);
__decorate([
  (0, import_class_validator2.IsOptional)(),
  (0, import_class_validator2.IsEnum)(import_substrate2.EnvironmentProfile),
  __metadata("design:type", typeof (_c = typeof import_substrate2.EnvironmentProfile !== "undefined" && import_substrate2.EnvironmentProfile) === "function" ? _c : Object)
], Meta.prototype, "envProfile", void 0);
`

  const expected = `var Meta = class {
    static _OPENAPI_METADATA_FACTORY() {
        return { appName: { required: false,  type: () =>  String }, appHost: { required: false,  type: () =>  String }, appVersion: { required: false,  type: () =>  String }, appNamespace: { required: false,  type: () =>  String }, appConfig: { required: false,  type: () =>  typeof (_a3 = typeof Record !== "undefined" && Record) === "function" ? _a3 : Object }, deviceInfo: { required: false,  type: () =>  typeof (_b3 = typeof Record !== "undefined" && Record) === "function" ? _b3 : Object }, userAgent: { required: false,  type: () =>  String }, envProfile: { required: false,  enum:  typeof (_c = typeof import_substrate2.EnvironmentProfile !== "undefined" && import_substrate2.EnvironmentProfile) === "function" ? _c : Object } }
    }
};`

  const output = await patchContents(input, { openapiMetadataFactory: true })

  assert.ok(output.startsWith(expected))
})

test('patchContents() injects `require.main` polyfill', async () => {})
test('patchContents() restores redoc.handlebars template path', async () => {})

test.run()
