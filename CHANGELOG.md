# Changelog

All notable changes to this project will be documented in this file.


## [0.1.18](https://github.com/AlarQ/portfolio/compare/v0.1.17...v0.1.18) (2026-06-16)


### Documentation

* **blog:** drop 'touch it constantly, but decide rarely' section ([3632108](https://github.com/AlarQ/portfolio/commit/36321084b1635d82e2f875126444050474420851))

## [0.1.17](https://github.com/AlarQ/portfolio/compare/v0.1.16...v0.1.17) (2026-06-16)


### Documentation

* **blog:** drop planned Dashboard line from spec-driven post ([23e150c](https://github.com/AlarQ/portfolio/commit/23e150c03890a3d633aa7c3ff8820505befb7ca9))

## [0.1.16](https://github.com/AlarQ/portfolio/compare/v0.1.15...v0.1.16) (2026-06-16)


### Bug Fixes

* **blog:** clear navbar overlap and stop diagrams upscaling ([#38](https://github.com/AlarQ/portfolio/issues/38)) ([0409342](https://github.com/AlarQ/portfolio/commit/040934208882340ee496b76563f71bdcbb4890ce))

## [0.1.15](https://github.com/AlarQ/portfolio/compare/v0.1.14...v0.1.15) (2026-06-16)


### Features

* pre-render Mermaid to static SVGs and collapse site to blog-only ([#37](https://github.com/AlarQ/portfolio/issues/37)) ([b34616b](https://github.com/AlarQ/portfolio/commit/b34616b194e70dcc3c9377cb7d039ea1a49920aa))

## [0.1.14](https://github.com/AlarQ/portfolio/compare/v0.1.13...v0.1.14) (2026-06-15)


### Features

* **blog, nav:** dev workflow blog post, show Home and Projects tabs in dev only ([#36](https://github.com/AlarQ/portfolio/issues/36)) ([f0af544](https://github.com/AlarQ/portfolio/commit/f0af544dfc629bd27dc205afa7007a18ec7cf663))
* **blog:** MDX blog — /blog index + /blog/[slug], build-time highlighting, a11y, security ([#34](https://github.com/AlarQ/portfolio/issues/34)) ([c42353c](https://github.com/AlarQ/portfolio/commit/c42353cf6e1dd35e204c56d418e4277661d98ada))
* **data:** extract Topic concept into src/data/topic.ts ([#25](https://github.com/AlarQ/portfolio/issues/25)) ([f579896](https://github.com/AlarQ/portfolio/commit/f5798967f0808152a81f523bcd7c71774aa11d1a))
* something ([c149d5c](https://github.com/AlarQ/portfolio/commit/c149d5c6987c068ba83821146c1d5b84fea7d8ac))


### Bug Fixes

* contribution graph ([#13](https://github.com/AlarQ/portfolio/issues/13)) ([4eb9d4c](https://github.com/AlarQ/portfolio/commit/4eb9d4cf3abc8a671838d9ff7c50c0abc709336e))
* hero ([d183d44](https://github.com/AlarQ/portfolio/commit/d183d449bedfe5c6453d28a1900a6e2a9c0c52dd))
* homepage sections ([92a9779](https://github.com/AlarQ/portfolio/commit/92a9779986ab74100a94b5921ae00b25ac0841f3))
* move skill icon-box opacity rule into skillPresentation seam ([#27](https://github.com/AlarQ/portfolio/issues/27)) ([c25ada1](https://github.com/AlarQ/portfolio/commit/c25ada181ee3e13f3b1a3ee1249bb40e82f1803e))


### Documentation

* add architecture deepening findings reports ([6448056](https://github.com/AlarQ/portfolio/commit/64480565d35dea9183fb879eca7189310c98edcc))
* add CONTEXT.md domain glossary ([7108694](https://github.com/AlarQ/portfolio/commit/710869485a9a294d51f5b8614d6109b37d4699ec))


### Code Refactoring

* add Achievement + Project presentation seams ([#17](https://github.com/AlarQ/portfolio/issues/17)) ([30ee67c](https://github.com/AlarQ/portfolio/commit/30ee67c7a61edeb6c6087504eac94fcc20db3b5c))
* deepen Skill module with typed icon-key ([aa7cab2](https://github.com/AlarQ/portfolio/commit/aa7cab276ead1152c64d386077859c8353a0af60))
* extract glowCardSx presentation seam ([#21](https://github.com/AlarQ/portfolio/issues/21)) ([89761d0](https://github.com/AlarQ/portfolio/commit/89761d06a6a7f6b8ec17520d785f923aa98b671e))
* extract useCarousel hook from ReadingSection (finding [#5](https://github.com/AlarQ/portfolio/issues/5)) ([#20](https://github.com/AlarQ/portfolio/issues/20)) ([18cea1b](https://github.com/AlarQ/portfolio/commit/18cea1b9b425eb73e3c004cdb134c5c7f200655a))
* extract useDrawerA11y seam from MobileNav ([#22](https://github.com/AlarQ/portfolio/issues/22)) ([cf4e2b2](https://github.com/AlarQ/portfolio/commit/cf4e2b2c7149ee0824eacd728cb927183ee82eb8))
* introduce DomainArea module, map areas instead of leadership/technical twins ([#16](https://github.com/AlarQ/portfolio/issues/16)) ([7913ebb](https://github.com/AlarQ/portfolio/commit/7913ebb0fd2966f3b5b039ab2ab4edf45008f74b))
* make theme the single brand-color seam (finding [#3](https://github.com/AlarQ/portfolio/issues/3)) ([#18](https://github.com/AlarQ/portfolio/issues/18)) ([ca6066c](https://github.com/AlarQ/portfolio/commit/ca6066c0bcfa6ee84706f3931cedd2b4898f6227))
* move owner identity and stats into src/data/profile.ts ([#24](https://github.com/AlarQ/portfolio/issues/24)) ([a193d55](https://github.com/AlarQ/portfolio/commit/a193d558083a03477aaef87754234e7973190927))
* move Reading domain type out of UI into data + presentation seam ([#15](https://github.com/AlarQ/portfolio/issues/15)) ([1931422](https://github.com/AlarQ/portfolio/commit/193142234cea2c3c61d8ced51c5d205db2951d15))
* navPresentation seam for nav gradients + colors (finding [#4](https://github.com/AlarQ/portfolio/issues/4)) ([#19](https://github.com/AlarQ/portfolio/issues/19)) ([6cc6032](https://github.com/AlarQ/portfolio/commit/6cc6032298dde33ef9346745aa33e585a6f60628))
* resolve architecture findings across nav, components, utils ([#35](https://github.com/AlarQ/portfolio/issues/35)) ([36734d1](https://github.com/AlarQ/portfolio/commit/36734d17ea688afd17289b3da06ae817501fbdc3))
* route nav overlay colors through brand seam ([#23](https://github.com/AlarQ/portfolio/issues/23)) ([90f348d](https://github.com/AlarQ/portfolio/commit/90f348d87d60740da58f04eebe11f4975ce8c240))
* unify Skill icon + category color into one presentation seam ([#14](https://github.com/AlarQ/portfolio/issues/14)) ([0dbaedd](https://github.com/AlarQ/portfolio/commit/0dbaeddc67b2969ca2c774b748d71db8eeefe36e))

## [0.1.13](https://github.com/AlarQ/portfolio/compare/v0.1.12...v0.1.13) (2026-02-11)


### Features

* home page refactor ([#11](https://github.com/AlarQ/portfolio/issues/11)) ([#12](https://github.com/AlarQ/portfolio/issues/12)) ([0a1d7c8](https://github.com/AlarQ/portfolio/commit/0a1d7c8c5fe11c9fac3179f63ed79f7d2ff65276))

## [0.1.12](https://github.com/AlarQ/portfolio/compare/v0.1.11...v0.1.12) (2026-02-10)


### Features

* home page refactor ([#11](https://github.com/AlarQ/portfolio/issues/11)) ([3592f10](https://github.com/AlarQ/portfolio/commit/3592f10bca7c8552053f14c5a0fe4525e6690de2))

## [0.1.11](https://github.com/AlarQ/portfolio/compare/v0.1.10...v0.1.11) (2026-02-05)


### Features

* ALA-120 - embedded GitHub pages ([#10](https://github.com/AlarQ/portfolio/issues/10)) ([888b0c7](https://github.com/AlarQ/portfolio/commit/888b0c7b1e4cae504b0ac3bdf60b4a2d77891d0f))

## [0.1.10](https://github.com/AlarQ/portfolio/compare/v0.1.9...v0.1.10) (2026-01-29)


### Features

* Github contributions ([c57704d](https://github.com/AlarQ/portfolio/commit/c57704dd759319d1bd39ae21bdf40663e3473032))

## [0.1.9](https://github.com/AlarQ/portfolio/compare/v0.1.8...v0.1.9) (2026-01-24)


### Features

* **ui:** implement floating rounded navbar with resume link ([#7](https://github.com/AlarQ/portfolio/issues/7)) ([05d3fba](https://github.com/AlarQ/portfolio/commit/05d3fba72b2f85a4b80aac30e537fcf6f60e45e1))

## [0.1.8](https://github.com/AlarQ/portfolio/compare/v0.1.7...v0.1.8) (2026-01-24)


### Features

* **home:** add topic section to homepage ([#6](https://github.com/AlarQ/portfolio/issues/6)) ([e9d85dd](https://github.com/AlarQ/portfolio/commit/e9d85dd6860bea11a45f9722dd458496ee9ac8ab))

## [0.1.7](https://github.com/AlarQ/portfolio/compare/v0.1.6...v0.1.7) (2026-01-24)


### Features

* **home:** add reading section with slider and improve layout alignment ([#5](https://github.com/AlarQ/portfolio/issues/5)) ([28768d2](https://github.com/AlarQ/portfolio/commit/28768d209395d2c566a25dbb725702df355241f5))

## [0.1.6](https://github.com/AlarQ/portfolio/compare/v0.1.5...v0.1.6) (2026-01-24)


### Features

* **homepage:** update content from CV ([#4](https://github.com/AlarQ/portfolio/issues/4)) ([cf07527](https://github.com/AlarQ/portfolio/commit/cf0752708b827983cff03f9c40a1113eb1f7fb29))

## [0.1.5](https://github.com/AlarQ/portfolio/compare/v0.1.4...v0.1.5) (2026-01-24)


### Features

* **homepage:** implement hero section with profile card and content ([#3](https://github.com/AlarQ/portfolio/issues/3)) ([ad306fb](https://github.com/AlarQ/portfolio/commit/ad306fb47ee6f7ed9d6800c8d119ebc60fa610a8))

## 0.1.4 (2026-01-24)


### Features

* **ci:** add automated release workflow ([#2](https://github.com/AlarQ/portfolio/issues/2)) ([b1f6eaf](https://github.com/AlarQ/portfolio/commit/b1f6eaf8b141e9e2c32382a167c52e1337f89fe6))
* init repo ([fca0394](https://github.com/AlarQ/portfolio/commit/fca03946eb5219ea4a217672ce864b227879e997))
* **theme:** implement blue and orange complementary palette ([#1](https://github.com/AlarQ/portfolio/issues/1)) ([48024fb](https://github.com/AlarQ/portfolio/commit/48024fb32ee9e9d182421c5325f64bf4659326f4))
* **theme:** set up MUI with ThemeRegistry for SSR support ([8a2d290](https://github.com/AlarQ/portfolio/commit/8a2d2900e81c9345cb3ccd152023ea42ee20b712))
* **ui:** add custom theme and Header navigation component ([4f73248](https://github.com/AlarQ/portfolio/commit/4f732487475a8393c07aa71404a5093f7d2483ce))


### Bug Fixes

* **layout:** move Header inside ThemeRegistry for proper theme access ([bf67891](https://github.com/AlarQ/portfolio/commit/bf678912a97bc65cabdaa5b94ae0b148e28ad80f))

## [0.1.3](https://github.com/AlarQ/portfolio/compare/v0.1.2...v0.1.3) (2026-01-24)

## [0.1.2](https://github.com/AlarQ/portfolio/compare/v0.1.1...v0.1.2) (2026-01-24)


### Features

* **ui:** add custom theme and Header navigation component ([4f73248](https://github.com/AlarQ/portfolio/commit/4f732487475a8393c07aa71404a5093f7d2483ce))

## 0.1.1 (2026-01-24)


### Features

* init repo ([fca0394](https://github.com/AlarQ/portfolio/commit/fca03946eb5219ea4a217672ce864b227879e997))
* **theme:** set up MUI with ThemeRegistry for SSR support ([8a2d290](https://github.com/AlarQ/portfolio/commit/8a2d2900e81c9345cb3ccd152023ea42ee20b712))
