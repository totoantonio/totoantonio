# totoantonio

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Swift](https://img.shields.io/badge/Swift-F05138?logo=swift&logoColor=white)](https://www.swift.org)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)
[![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/totoantonio/totoantonio)

[![Live site](https://img.shields.io/website?url=https%3A%2F%2Ftotoantonio.pages.dev&up_message=totoantonio.pages.dev&up_color=0A84FF&down_message=offline&label=live)](https://totoantonio.pages.dev)
[![Last commit](https://img.shields.io/github/last-commit/totoantonio/totoantonio?color=30D158)](https://github.com/totoantonio/totoantonio/commits/main)
[![Repo size](https://img.shields.io/github/repo-size/totoantonio/totoantonio?color=6E6E73)](https://github.com/totoantonio/totoantonio)
[![Build](https://img.shields.io/badge/build-none-30D158)](#structure)

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
