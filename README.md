# nestjs-esm-fix
> Patch Nestjs app ESM bundles to make them work RHRN

## Problem
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

2. openapi / class-validator DTOs are referenced by `require` API.
```js
export class CspReportDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { timestamp: { required: false, type: () => Object }, 'csp-report': { required: true, type: () => require("./csp.dto.js").CspReport } };
    }
}
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
nestjs-esm-fix target
```
### JS API
```js
import {fix} from 'nestjs-esm-fix'
await fix({
  cwd: './target',
  openapiVar: true,
  openapiTypeRef: true,
})
```

## License
[MIT](./LICENSE)
