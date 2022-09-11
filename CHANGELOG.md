## [1.4.0](https://github.com/antongolub/nestjs-esm-fix/compare/v1.3.2...v1.4.0) (2022-09-11)

### Features
* feat: let target be a bundle file ([ad0f5a2](https://github.com/antongolub/nestjs-esm-fix/commit/ad0f5a2a2f695f9d6aac0cbe339d9dc21288121b))

### Fixes & improvements
* fix: strengthen decorator pattern ([76b5f58](https://github.com/antongolub/nestjs-esm-fix/commit/76b5f58b09cbfd67b2845fca5cfed39a8d4d284a))

## [1.3.2](https://github.com/antongolub/nestjs-esm-fix/compare/v1.3.1...v1.3.2) (2022-09-11)

### Fixes & improvements
* fix: enable `openapi.meta` flag by default ([7760ee4](https://github.com/antongolub/nestjs-esm-fix/commit/7760ee474633a4bb058f2f94daee8ef042979176))

## [1.3.1](https://github.com/antongolub/nestjs-esm-fix/compare/v1.3.0...v1.3.1) (2022-09-11)

### Fixes & improvements
* fix: strengthen class require pattern ([51716d1](https://github.com/antongolub/nestjs-esm-fix/commit/51716d14bcc3503a4741bfb42ee00dce03cabd87))

## [1.3.0](https://github.com/antongolub/nestjs-esm-fix/compare/v1.2.4...v1.3.0) (2022-09-11)

### Features
* feat: add redoc tpl inject ([940eaa5](https://github.com/antongolub/nestjs-esm-fix/commit/940eaa5c13d01fe290f693dcfb5c8b561136a29d))

## [1.2.4](https://github.com/antongolub/nestjs-esm-fix/compare/v1.2.3...v1.2.4) (2022-09-10)

### Fixes & improvements
* fix: avoid some false positive replacements ([64cdc8c](https://github.com/antongolub/nestjs-esm-fix/commit/64cdc8c484247c19f2d8d292aee9fa9d913cad15))

## [1.2.3](https://github.com/antongolub/nestjs-esm-fix/compare/v1.2.2...v1.2.3) (2022-09-10)

### Fixes & improvements
* docs: mention ([](https://github.com/antongolub/nestjs-esm-fix/commit/7135c4c))

## [1.2.2](https://github.com/antongolub/nestjs-esm-fix/compare/v1.2.1...v1.2.2) (2022-09-10)

### Fixes & improvements
* fix: handle both ` ([](https://github.com/antongolub/nestjs-esm-fix/commit/1dea218))

## [1.2.1](https://github.com/antongolub/nestjs-esm-fix/compare/v1.2.0...v1.2.1) (2022-09-10)

### Fixes & improvements
* fix: avoid imported names clashes ([e09e5ab](https://github.com/antongolub/nestjs-esm-fix/commit/e09e5ab834ad375f4c35e77373d79fe23ed79aa7))

## [1.2.0](https://github.com/antongolub/nestjs-esm-fix/compare/v1.1.1...v1.2.0) (2022-09-10)

### Features
* feat: inject `require.main` polyfill ([ae2ea07](https://github.com/antongolub/nestjs-esm-fix/commit/ae2ea071ed76cc88c0242d3bc9b3600bcae12b31))
* feat: replace `require` for builtins with import api ([85f74b1](https://github.com/antongolub/nestjs-esm-fix/commit/85f74b19d5377bac8c1f927374da9d6722875b15))
* feat: restore _OPENAPI_METADATA_FACTORY if empty ([756017c](https://github.com/antongolub/nestjs-esm-fix/commit/756017c4f448fa08a06b1fd7fff210101b449451))

### Fixes & improvements
* refactor: use `importify` to patch all require statements ([fe8463e](https://github.com/antongolub/nestjs-esm-fix/commit/fe8463e8b156689ac03818244e0f81772ff7d482))

## [1.1.1](https://github.com/antongolub/nestjs-esm-fix/compare/v1.1.0...v1.1.1) (2022-08-18)

### Fixes & improvements
* docs: formatting ([7fac923](https://github.com/antongolub/nestjs-esm-fix/commit/7fac923942bedeffa2c96d79b751c30ef8030360))

## [1.1.0](https://github.com/antongolub/nestjs-esm-fix/compare/v1.0.6...v1.1.0) (2022-08-16)

### Features
* feat: introduce `--target` option ([d842b99](https://github.com/antongolub/nestjs-esm-fix/commit/d842b990f3e19054267bab82317854306769fa42))

## [1.0.6](https://github.com/antongolub/nestjs-esm-fix/compare/v1.0.5...v1.0.6) (2022-08-16)

### Fixes & improvements
* fix: relax regexp ([71a0419](https://github.com/antongolub/nestjs-esm-fix/commit/71a041943bf92ebc63f38353ce9e77ff57277382))

## [1.0.5](https://github.com/antongolub/nestjs-esm-fix/compare/v1.0.4...v1.0.5) (2022-08-16)

### Fixes & improvements
* fix: fix build:es6 ([f1423aa](https://github.com/antongolub/nestjs-esm-fix/commit/f1423aaa1b60a0106100bbeface94474dfe3bc28))

## [1.0.4](https://github.com/antongolub/nestjs-esm-fix/compare/v1.0.3...v1.0.4) (2022-08-16)

### Fixes & improvements
* fix: fix build script ([fc45d9b](https://github.com/antongolub/nestjs-esm-fix/commit/fc45d9b04577fe6d0d7621fab96f9582a0e76b0b))

## [1.0.3](https://github.com/antongolub/nestjs-esm-fix/compare/v1.0.2...v1.0.3) (2022-08-15)

### Fixes & improvements
* fix: fix import join ([455a5dc](https://github.com/antongolub/nestjs-esm-fix/commit/455a5dcd4daf9663fa886f94bf6b462885fdef45))

## [1.0.2](https://github.com/antongolub/nestjs-esm-fix/compare/v1.0.1...v1.0.2) (2022-08-15)

### Fixes & improvements
* fix: fix bin path ([1f7068f](https://github.com/antongolub/nestjs-esm-fix/commit/1f7068fe5a63c1aebcb339eee14b8bd59e16d0fa))

## [1.0.1](https://github.com/antongolub/nestjs-esm-fix/compare/v1.0.0...v1.0.1) (2022-08-15)

### Fixes & improvements
* docs: add status badges ([94a1cc0](https://github.com/antongolub/nestjs-esm-fix/commit/94a1cc0f3f419cdb6aad80de63e947730c7c1c08))

## [1.0.0](https://github.com/antongolub/nestjs-esm-fix/compare/undefined...v1.0.0) (2022-08-15)

### Features
* feat: add basic patcher ([d39ad06](https://github.com/antongolub/nestjs-esm-fix/commit/d39ad068c999315db045f33ee08e0017c2651362))
* feat: add cli ([d2f9647](https://github.com/antongolub/nestjs-esm-fix/commit/d2f96471fc562d0082fa785ee4b5c038dbac0e8e))

### Fixes & improvements
* docs: add basic description ([8c23cab](https://github.com/antongolub/nestjs-esm-fix/commit/8c23cab684222d32b37385e1afc4288fd24eeed3))
