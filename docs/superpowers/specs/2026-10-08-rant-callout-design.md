# Rant callout design

## Goal

Add a Markdown callout for brief asides and complaints, with a classic chat-bubble icon and a color that is distinct from existing Obsidian-theme callout types.

## Authoring interface

Authors write:

```md
> [!rant]
> 这段 API 的命名实在令人费解。
```

The default title is `吐槽`. Authors may override it with `> [!rant] 自定义标题`.

## Rendering

Configure the existing `rehype-callouts` integration with a custom `rant` callout. Its indicator is an inline, aria-hidden MessageCircle-style SVG, so no new icon runtime or Markdown syntax is introduced.

The generated container continues to use the package's standard `.callout` markup and `data-callout="rant"` attribute. Existing nesting and collapsible callout behavior remain unchanged.

## Visual design

Use a muted periwinkle color family that is not used by the imported Obsidian types:

- Light theme: `rgb(88, 101, 201)` (`#5865C9`)
- Dark theme: `rgb(174, 183, 255)` (`#AEB7FF`)

The color connects the callout to conversation UI without duplicating the theme's blue, teal, green, orange, red, violet, or gray type families.

## Validation

Add a focused Node test that renders a `rant` callout with the configured processor and asserts its `data-callout` value, default Chinese title, and SVG indicator. Run the focused test, the full test suite, and the production build.
