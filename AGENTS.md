# Project instructions

Use the `fls-landing-builder` skill.

This is an FLS/Vite frontend project.

## Main rules

- Work only inside `src`.
- Do not edit `dist` manually.
- Before changing files, inspect:
  - `template.config.js`
  - `vite.config.js`
  - `src/index.html`
  - `src/components/pages`
  - `src/components/layout`
  - `src/components/custom`

## HTML

- Use existing template/include system.
- Page content belongs in `src/components/pages/<page>/<page>.html`.
- Do not duplicate `html`, `body`, `.wrapper`, `header`, `footer`.
- Reusable sections/components should be placed in `src/components/custom/<component-name>/`.
- Connect reusable components through `<include src="@components/custom/<component>/<component>.html" locals='{}'></include>`.

## SCSS

- Page-specific styles belong near the page component.
- Reusable component styles belong near the custom component.
- Use BEM.
- Use existing SCSS mixins and functions.
- Prefer `adaptiveValue`, `toRem`, `toEm` when appropriate.
- Do not add heavy libraries for simple layout or animation.

## JS

- Use vanilla JavaScript unless the project already uses another approach.
- Check elements before adding listeners.
- Do not break build if optional elements are missing.
- Component-specific JS should stay near the component.

## Assets

- Use `@img` in HTML/SCSS when possible.
- Import images in JS when JS controls image paths.
- Do not use absolute paths to local Windows files.
- Optimize image usage and do not load unnecessary assets.

## Workflow

- First analyze the structure.
- Then explain the planned changes.
- Then edit only the necessary files.
- After changes, run build/check commands if available.

## Code style reference

If `.code-examples/` exists, use files inside it only as a style reference.

Do not copy content blindly.
Do not edit files inside `.code-examples/`.
Use examples to understand:
- BEM naming
- SCSS nesting
- adaptiveValue usage
- page/custom component structure
- vanilla JS style