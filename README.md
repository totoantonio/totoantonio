# totoantonio

Personal site for totoantonio — Mac apps built out of need and necessity, sold without subscriptions or accounts.

Live at **https://totoantonio.pages.dev** (Cloudflare Pages, deployed from `main`).

## Pages

| File | URL | What it is |
| --- | --- | --- |
| `index.html` | `/` | Home — who I am and every app in one place |
| `maceq.html` | `/maceq.html` | macEQ — system-wide audio equalizer for macOS |
| `keyboards.html` | `/keyboards.html` | KeyboardS — Mac keyboard shortcut reference |
| `upscape.html` | `/upscape.html` | Upscape — private AI image upscaler for Mac |
| `support.html` | `/support.html` | Setup, troubleshooting and contact |
| `privacy.html` | `/privacy.html` | Privacy policy |

## Structure

Static HTML with no build step. Shared styling lives in `theme.css` and `theme.js` (theme toggle, scroll reveal); each page carries its own layout styles in a `<style>` block. Images sit in `Assets/`, with WebP versions in `Assets/optimized/` served through `srcset`. `tools/render_sf_symbols.swift` regenerates the SF Symbol PNGs in `Assets/Symbols/`.

Edit a file, commit to `main`, and Cloudflare Pages deploys it.
