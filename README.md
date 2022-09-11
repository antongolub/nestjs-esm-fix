# nestjs-esm-fix
[![CI](https://github.com/antongolub/nestjs-esm-fix/actions/workflows/ci.yaml/badge.svg?branch=master)](https://github.com/antongolub/nestjs-esm-fix/actions/workflows/ci.yaml)
[![Maintainability](https://api.codeclimate.com/v1/badges/af8edb33072e8e033ce7/maintainability)](https://codeclimate.com/github/antongolub/nestjs-esm-fix/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/af8edb33072e8e033ce7/test_coverage)](https://codeclimate.com/github/antongolub/nestjs-esm-fix/test_coverage)
[![npm (tag)](https://img.shields.io/npm/v/nestjs-esm-fix)](https://www.npmjs.com/package/nestjs-esm-fix)

> Patch [Nestjs](https://github.com/nestjs/nest) app ESM bundles to make them work RHRN  
> ⚠️ This is a temporary solution until Nestjs is fixed

## Stack
Nestjs 9.x + esbuild

## Problems
1. `openapi` is not defined. https://github.com/nestjs/swagger/issues/1450
```js
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
```

2. openapi / class-validator DTOs are referenced by `require` API. https://github.com/microsoft/TypeScript/issues/43329
```js
export class CspReportDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { timestamp: { required: false, type: () => Object }, 'csp-report': { required: true, type: () => require("./csp.dto.js").CspReport } };
    }
}
```

3. NodeJS builtins are referenced via `require` API.
```js
var require_async4 = __commonJS({
  "node_modules/resolve/lib/async.js"(exports, module2) {
    var fs2 = require("fs");
```

4. esbuild-compiled ESM bundle cannot refer to `views/redoc.handlebars`
```js
const redocFilePath = path_1.default.join(__dirname, "..", "views", "redoc.handlebars");
```

5. `_OPENAPI_METADATA_FACTORY` class fields may be empty, so the swagger declaration cannot be properly rendered.
```js
var Meta = class {
};
// →
var Meta = class {
  static _OPENAPI_METADATA_FACTORY() {
    return { appName: { required: false,  type: () =>  String }, appHost: { required: false,  type: () =>  String }, appVersion: { required: false,  type: () =>  String }, appNamespace: { required: false,  type: () =>  String }, appConfig: { required: false,  type: () =>  typeof (_a3 = typeof Record !== "undefined" && Record) === "function" ? _a3 : Object }, deviceInfo: { required: false,  type: () =>  typeof (_b3 = typeof Record !== "undefined" && Record) === "function" ? _b3 : Object }, userAgent: { required: false,  type: () =>  String }, envProfile: { required: false,  enum:  typeof (_c = typeof import_substrate2.EnvironmentProfile !== "undefined" && import_substrate2.EnvironmentProfile) === "function" ? _c : Object } }
  }
};
```


## Solution
Old good monkey patching.

## Install
```bash
yarn add -D nestjs-esm-fix
```

## Usage
### CLI
```bash
nestjs-esm-fix target/**/*.js
nestjs-esm-fix --target=target/**/*.js
nestjs-esm-fix --target=**/* --cwd=target
```
| Option           | Description                                                                                                            | Default         |
|------------------|------------------------------------------------------------------------------------------------------------------------|-----------------|
| `--target`       | Pattern to match files to fix.                                                                                         | `**/*`          |
| `--cwd`          | Current working dir                                                                                                    | `process.cwd()` |
| `--openapi-var`  | Inject openapi variable. Set `--no-openapi-var` to disable.                                                            | `true`          |
| `--dirname-var`  | Inject `__dirname` and `__filename` polyfills.                                                                         | `true`          |
| `--importify`    | Replace `require` with `import` API for Nodejs builtins. Replace `type: () => require(smth)` statements with `import`. | `true`          |
| `--require-main` | Inject `main` field for `require` API polyfill                                                                         | `true`          |
| `--redoc-tpl`    | Inject `redoc.hbs` templates                                                                                           | `true`          |

### JS API
```js
import { fix } from 'nestjs-esm-fix'
await fix({
  cwd: '.',
  target: 'target/**/*.js',
  openapiVar: true,
  dirnameVar: true,
  importify: true,
  requireMain: true
})
```

## License
[MIT](./LICENSE)
