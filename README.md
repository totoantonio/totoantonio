# totoantonio

[![Live site](https://img.shields.io/badge/live-totoantonio.pages.dev-0A84FF)](https://totoantonio.pages.dev)
[![Deployed on Cloudflare Pages](https://img.shields.io/badge/deploy-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)
[![Static HTML](https://img.shields.io/badge/build-none-30D158)](#structure)
[![Made for macOS](https://img.shields.io/badge/apps-macOS-000000?logo=apple&logoColor=white)](https://totoantonio.pages.dev)

Personal site for totoantonio — Mac apps built out of need and necessity, sold without subscriptions or accounts.

Live at **https://totoantonio.pages.dev**

## Apps

| App | Page | What it does |
| --- | --- | --- |
| macEQ | [`maceq.html`](maceq.html) | System-wide audio equalizer for macOS |
| KeyboardS | [`keyboards.html`](keyboards.html) | Fast lookup for Mac keyboard shortcuts |
| Upscape | [`upscape.html`](upscape.html) | Private AI image upscaler, runs on-device |

Plus [`index.html`](index.html) (home), [`support.html`](support.html) and [`privacy.html`](privacy.html).

## Structure

Static HTML, no build step.

- `theme.css` / `theme.js` — shared styling, theme toggle, scroll reveal
- each page — its own layout in a `<style>` block
- `Assets/` — images, with WebP versions in `Assets/optimized/` served via `srcset`
- `tools/` — Swift script that regenerates the SF Symbol PNGs

Edit a file, commit to `main`, Cloudflare Pages deploys it.
