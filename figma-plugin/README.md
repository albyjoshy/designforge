# DesignForge AI Figma plugin

This is the fourth milestone for a Figma integration. It accepts a product brief, creates a source-linked inspiration board with thumbnails, analyzes design signals, and creates an editable concept frame using the repository's DesignForge token values.

## Build and run

From this directory, run `npm install` and `npm run build`. In Figma, use **Plugins → Development → Import plugin from manifest** and choose `manifest.json`.

## Reference search boundary

The included `SearchLinkProvider` uses official search URLs and does not scrape or download artwork. Results are inspiration metadata, not copied artwork. API-backed providers can implement the `ReferenceProvider` interface later; credentials must remain outside the plugin bundle.

The board also includes deterministic analysis signals for hierarchy, responsive behavior, accessibility, and originality. These are design guidance, not claims about the source artwork.
