# Artalk Comments Integration Design

## Goal

Replace the shared Giscus comment widget with Artalk on post and Links pages while retaining the existing shared-component structure. Enable LaTeX rendering in comments through the official Artalk KaTeX plugin.

## Scope

- Keep `src/components/Comments.astro` as the single comment integration point.
- Keep the existing `<Comments />` usage on post and Links pages unchanged.
- Remove all Giscus-specific client configuration from the shared component.
- Use the already-installed `artalk` and `@artalk/plugin-katex` packages.
- Do not migrate existing Giscus comments or change the Artalk backend deployment.

## Client Configuration

Initialize Artalk with these values:

```ts
{
  server: "https://comment.cavill.site",
  site: "Cavill Blog",
  pageKey: location.pathname,
  pageTitle: document.title,
}
```

The relative pathname is the stable page identifier and permits future domain changes. The current document title is sent to Artalk for its page-management and notification interfaces.

## Component and Lifecycle

`Comments.astro` will render an accessible comment section containing a dedicated Artalk mount element. Its client script will:

1. Import Artalk, the Artalk stylesheet, the KaTeX stylesheet, and `ArtalkKatexPlugin` through Vite.
2. Register the KaTeX plugin once before creating an Artalk instance.
3. Initialize Artalk after Astro's `astro:page-load` event when the mount element exists.
4. Destroy an existing instance before initializing another one.
5. Destroy the active instance on `astro:before-swap` so Astro ClientRouter navigation cannot retain stale DOM bindings.

This lifecycle supports direct page loads, navigation between posts, navigation between a comment page and a page without comments, and return navigation to a comment page.

## Mathematical Comments

The official `@artalk/plugin-katex` plugin will be registered with `Artalk.use`. KaTeX's stylesheet will be bundled so inline and display formulas emitted by the plugin are styled correctly.

The installed plugin declares a KaTeX peer range below `0.18.0`, while the current workspace contains `katex@0.18.1`. The implementation will preserve the user's dependency changes initially. If type checking, bundling, or browser verification reveals an incompatibility, KaTeX will be adjusted to the newest compatible release below `0.18.0` and the lockfile will be updated accordingly.

## Error Behavior

If the Artalk mount element is absent, initialization will return without creating an instance. Backend or network errors remain visible through Artalk's built-in interface and browser diagnostics; the surrounding page continues to render normally.

## Verification

The existing Giscus integration test will be replaced using test-driven development:

1. Change the test expectations to require the shared Artalk mount, package imports, KaTeX plugin registration, the four requested configuration values, and Astro navigation lifecycle handling.
2. Require post and Links pages to continue importing and rendering the shared component.
3. Require Giscus client code and configuration to be absent.
4. Run the changed test before implementation and confirm it fails because Artalk is not yet integrated.
5. Implement the minimum component change needed to pass.
6. Run the complete test suite, Astro type checking/build, formatting checks, and linting.

Browser verification will confirm that the Artalk client contacts `https://comment.cavill.site`, switches page keys during client-side navigation, and renders a sample KaTeX expression when the configured backend is reachable.
