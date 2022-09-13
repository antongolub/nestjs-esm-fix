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
    return { timestamp: { required: false, type: () => Object }, 'csp-report': { required: true, type: () => require("./csp.dto.js").CspReport, 'csp-reports': { required: true, type: () => [require("./csp.dto.js").CspReport] } };
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
  const after = `import { fileURLToPath } from 'node:url'
import { dirname as __pathDirname} from 'node:path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = __pathDirname(__filename)
import { CspReport as CspReport__ } from './csp.dto.js';
import openapi from "@nestjs/swagger";

export class CspReportDto {
  static _OPENAPI_METADATA_FACTORY() {
    return { timestamp: { required: false, type: () => Object }, 'csp-report': { required: true, type: () => CspReport__, 'csp-reports': { required: true, type: () => [CspReport__] } };
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
  const result = (
    await fse.readFile(path.join(temp, 'index.js'), {
      encoding: 'utf8',
    })
  ).replaceAll(/CspReport__\w+/g, 'CspReport__')

  assert.fixture(result, after)
})

test('fix() returns contents as is if no occurrences found', async () => {
  const temp = temporaryDirectory()
  const before = `foo`
  const after = `foo`

  await fse.outputFile(path.join(temp, 'index.js'), before)
  await fix({ cwd: temp, target: '**/*', dirnameVar: false })
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

test('patchContents() restores openapi metadata', async () => {
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
        return { 'appName': { required: false, type: () =>  String }, 'appHost': { required: false, type: () =>  String }, 'appVersion': { required: false, type: () =>  String }, 'appNamespace': { required: false, type: () =>  String }, 'appConfig': { required: false, type: () =>  typeof (_a3 = typeof Record !== "undefined" && Record) === "function" ? _a3 : Object }, 'deviceInfo': { required: false, type: () =>  typeof (_b3 = typeof Record !== "undefined" && Record) === "function" ? _b3 : Object }, 'userAgent': { required: false, type: () =>  String }, 'envProfile': { required: false, enum:  typeof (_c = typeof import_substrate2.EnvironmentProfile !== "undefined" && import_substrate2.EnvironmentProfile) === "function" ? _c : Object } }
    }
};`

  const output = await patchContents(input, { openapiMeta: true })
  assert.ok(output.startsWith(expected))
})

test('patchContents() restores openapi metadata for Array types', async () => {
  const input = `export class CreateEventBatchDto {
}
__decorate([
  IsArray(),
  ValidateNested({ each: true }),
  Type(() => CreateEventDto),
  __metadata("design:type", Array)
], CreateEventBatchDto.prototype, "events", void 0);
`
  const expected = `export class CreateEventBatchDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { 'events': { type: () => [CreateEventDto] } }
    }
};`
  const output = await patchContents(input, { openapiMeta: true })
  assert.ok(output.startsWith(expected))
})

test('patchContents() replaces builtins require() with import API', async () => {
  const input = `// node_modules/@nestjs/common/file-stream/streamable-file.js
var require_streamable_file = __commonJS({
  "node_modules/@nestjs/common/file-stream/streamable-file.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamableFile = void 0;
    var stream_1 = __require("stream");
    var util_1 = __require("util");
`
  const expected = `import __import_STREAM from 'stream'
import __import_UTIL from 'util'
// node_modules/@nestjs/common/file-stream/streamable-file.js
var require_streamable_file = __commonJS({
  "node_modules/@nestjs/common/file-stream/streamable-file.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamableFile = void 0;
    var stream_1 = __import_STREAM;
    var util_1 = __import_UTIL;
`
  const output = await patchContents(input, { importBuiltins: true })
  assert.equal(output, expected)
})

test('patchContents() injects `require.main` polyfill', async () => {
  const input = `var requireFunction = "function" === typeof __webpack_require__ || "function" === typeof __non_webpack_require__ ? __non_webpack_require__ : __require;
    var isInstalledWithPNPM = /* @__PURE__ */ __name(function(resolved) {`
  const expected = `var requireFunction = "function" === typeof __webpack_require__ || "function" === typeof __non_webpack_require__ ? __non_webpack_require__ : __require;
requireFunction.main = {
  filename: __filename
};

    var isInstalledWithPNPM = /* @__PURE__ */ __name(function(resolved) {`

  const output = await patchContents(input, { requireMain: true })
  assert.equal(output, expected)
})

test('patchContents() restores redoc.handlebars template path', async () => {
  const input = 'const redocHTML = yield hbs.render(redocFilePath, renderData);'
  const expected = `const redocHTML = yield hbs._renderTemplate(hbs._compileTemplate(\`<!DOCTYPE html>`

  const output = await patchContents(input, { redocTpl: true })
  assert.ok(output.startsWith(expected))
})

test('patchContents() simplifies complex openapi types', async () => {
  const input = `
  __metadata("design:type", typeof (_d = typeof Array !== "undefined" && Array) === "function" ? _d : Object)
  __metadata("design:type", typeof (_e = typeof import_substrate2.LogLevel !== "undefined" && import_substrate2.LogLevel) === "function" ? _e : Object)
  __metadata("design:type", typeof (_a3 = typeof Record !== "undefined" && Record) === "function" ? _a3 : Object)
`
  const expected = `
  __metadata("design:type", Array)
  __metadata("design:type", import_substrate2.LogLevel)
  __metadata("design:type", typeof (_a3 = typeof Record !== "undefined" && Record) === "function" ? _a3 : Object)
`
  const output = await patchContents(input, { openapiComplexTypes: true })

  assert.equal(output, expected)
})

test.run()
