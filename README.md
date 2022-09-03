# nestjs-esm-fix
[![CI](https://github.com/antongolub/nestjs-esm-fix/actions/workflows/ci.yaml/badge.svg?branch=master)](https://github.com/antongolub/nestjs-esm-fix/actions/workflows/ci.yaml)
[![Maintainability](https://api.codeclimate.com/v1/badges/af8edb33072e8e033ce7/maintainability)](https://codeclimate.com/github/antongolub/nestjs-esm-fix/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/af8edb33072e8e033ce7/test_coverage)](https://codeclimate.com/github/antongolub/nestjs-esm-fix/test_coverage)
[![npm (tag)](https://img.shields.io/npm/v/nestjs-esm-fix)](https://www.npmjs.com/package/nestjs-esm-fix)

> Patch [Nestjs](https://github.com/nestjs/nest) app ESM bundles to make them work RHRN  
> ⚠️ This is a temporary solution until Nestjs is fixed

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
3. esbuild-compiled ESM bundle cannot refer to `views/redoc.handlebars`
```js
const redocFilePath = path_1.default.join(__dirname, "..", "views", "redoc.handlebars");
```

4. NodeJS builtins are referenced via `require` API.
```js
var require_async4 = __commonJS({
  "node_modules/resolve/lib/async.js"(exports, module2) {
    var fs2 = require("fs");
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
| Option               | Description                                                | Default         |
|----------------------|------------------------------------------------------------|-----------------|
| `--openapi-var`      | Inject openapi variable. Set `--no-openapi-var` to disable. | `true`          |
| `--openapi-type-ref` | Replace `type: () => require` statements with `import`.    | `true`          |
| `--cwd`              | Current working dir                                        | `process.cwd()` |
| `--target`           | Pattern to match files to fix.                             | `**/*`          |
| `--importify`        | Replace `require` with `import` API for Nodejs builtins.   | `true`          |
| `--redoc-template`   | Inject `redoc.hbs` templates                               | `true`          |

### JS API
```js
import {fix} from 'nestjs-esm-fix'
await fix({
  cwd: '.',
  target: 'target/**/*.js',
  openapiVar: true,
  openapiTypeRef: true,
})
```

## License
[MIT](./LICENSE)
