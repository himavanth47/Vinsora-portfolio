# VINSORA – Company Website

A one-page website built with plain HTML, CSS and JavaScript. There's no build step and nothing to install.

## Run it
Open `index.html` in a browser, or start a local server from this folder:

```bash
python -m http.server 8000
```

## Structure
```
index.html                 – all page content
css/style.css              – styles (brand colours are variables at the top)
js/main.js                 – menu, filters, slide-ins, typing quote, WhatsApp links
assets/logo.svg            – logo mark
assets/favicon.svg         – browser tab icon
assets/projects/*.jpg      – project screenshots
```

## Common edits
- **Brand colours:** change `--primary` and `--primary-dark` at the top of `css/style.css`.
- **WhatsApp number:** `WHATSAPP_NUMBER` in `js/main.js`, plus the `wa.me` and `tel:` links in `index.html`.
- **Testimonials:** the featured quote types itself out from the `data-text` attribute in `#testimonials`. Change both `data-text` and the text inside the two spans together. For more quotes, copy the commented `<figure class="testimonial">` block.
- **VOC Software project:** add `assets/projects/voc-software.jpg`, replace the placeholder `<div class="project-img project-img-placeholder">` with an `<img>`, and update the description.
- **FAQ:** edit the `<details>` blocks in the `#faq` section.
- **New project:** copy any `<article class="project-card">` block and set `data-category` to `software` or `website`, so the filter buttons pick it up.

## Hosting
Upload the whole folder to Netlify, Vercel, GitHub Pages or any normal web host.
