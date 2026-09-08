<template>
  <div class="space-y-8">
    <article class="rounded-2xl border ui-border-strong ui-surface p-6">
      <h1 class="text-3xl font-bold">
        Overview
      </h1>
      <p class="mt-3 max-w-4xl text-lg leading-8 ui-text-muted">
        GSPA UI is a complete component suite for Vue.js with reusable building blocks for forms, data views,
        navigation shells, overlays, and visual analytics.
      </p>
      <p class="mt-4 max-w-4xl text-lg leading-8 ui-text-muted">
        The goal is to help teams ship consistent interfaces quickly by combining prebuilt components and theme helpers.
      </p>
    </article>

    <article class="rounded-2xl border ui-border-strong ui-surface p-6">
      <h2 class="text-2xl font-bold">
        Quick Start Flow
      </h2>
      <ol class="mt-3 space-y-2 text-sm ui-text-muted">
        <li>1. Install the package and icon dependencies.</li>
        <li>2. Register plugin and directives in `main.js`.</li>
        <li>3. Configure theming and test with the Components page.</li>
      </ol>
    </article>

    <article class="rounded-2xl border ui-border-strong ui-surface p-6">
      <h2 class="text-2xl font-bold">
        How Interactive Docs Work
      </h2>
      <p class="mt-3 max-w-4xl text-base leading-7 ui-text-muted">
        The interactive docs render the real component files from this library, not mock examples.
        Each detail page (for example, `/components/components/button`) loads the component module dynamically,
        mounts it with Vue&apos;s dynamic component API, and binds editable playground props to it.
      </p>
      <ol class="mt-4 space-y-2 text-sm ui-text-muted">
        <li>1. `componentDocs.js` maps component names to slugs and lazy loaders.</li>
        <li>2. The route `/components/components/:componentSlug` resolves the selected component.</li>
        <li>3. The page loads the component and renders it with <code>&lt;component :is="loadedComponent" /&gt;</code>.</li>
        <li>4. Playground controls update `playgroundValues`, which are passed via `v-bind`.</li>
        <li>5. The props table is generated from runtime component prop definitions.</li>
      </ol>
    </article>
  </div>
</template>
