# Scroll progress bar

A fixed vertical reading-progress navigator with clickable steps, hover/focus highlighting, keyboard navigation, and an accessible progress value.

## Use

1. Add `progress-bar.css` to the page.
2. Load `scroll-timeline.js` after the page body, for example with `defer`:

```html
<link rel="stylesheet" href="progress-bar.css">
<script src="scroll-timeline.js" defer></script>
```

The page should have a scrollable document. The bar is created automatically; no markup is required. It observes the first `<article>` for content-size changes, or the document when there is no article.

Keep `LICENSE` with redistributed copies of these source files.
