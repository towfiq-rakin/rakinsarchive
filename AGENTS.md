# AGENTS.md - Quartz Codebase Guide

This document provides guidance for AI coding agents working in the Quartz codebase.

## Project Overview

Quartz v4 is a static site generator for publishing digital gardens and Obsidian notes as websites.

**Tech Stack:**

- TypeScript (strict mode) with Node.js >= 22
- Preact for JSX components
- esbuild for bundling
- ES Modules (`"type": "module"`)

## Build/Lint/Test Commands

### Primary Commands

```bash
npm run check          # Type check + Prettier format check
npm run format         # Auto-format code with Prettier
npm test               # Run all tests
```

### Build Commands

```bash
npx quartz build                # Build the site
npx quartz build --serve        # Build and serve with hot reload
npx quartz build --bundleInfo   # Build with bundle analysis
npm run docs                    # Build and serve documentation
```

### Running Single Tests

The project uses Node.js native test runner (`node:test`).

```bash
# Run a specific test file
npx tsx --test quartz/util/path.test.ts

# Run tests matching a name pattern
npx tsx --test --test-name-pattern="transforms" quartz/util/path.test.ts

# Run all tests
npm test
```

## Code Style Guidelines

### Formatting (Prettier)

- No semicolons
- 2-space indentation
- 100-character line width
- Trailing commas everywhere (including function parameters)
- Quote props only as-needed

### Import Style

```typescript
// 1. External dependencies first
import { slug as slugAnchor } from "github-slugger"
import type { Element as HastElement } from "hast"
import path from "path"

// 2. Internal imports after (relative paths)
import { clone } from "./clone"
import { FullSlug, TransformOptions } from "../../util/path"
```

- Use `import type` for type-only imports
- Prefer named imports over default imports
- Use `as` for aliasing when needed
- Use relative paths for internal imports

### Naming Conventions

| Element            | Convention             | Example                        |
| ------------------ | ---------------------- | ------------------------------ |
| Files (utilities)  | camelCase.ts           | `path.ts`, `clone.ts`          |
| Files (components) | PascalCase.tsx         | `Breadcrumbs.tsx`              |
| Test files         | \*.test.ts             | `path.test.ts`                 |
| Inline scripts     | \*.inline.ts           | `spa.inline.ts`                |
| Types/Interfaces   | PascalCase             | `FullSlug`, `TransformOptions` |
| Constants          | UPPER_CASE             | `QUARTZ`                       |
| Functions          | camelCase              | `slugifyFilePath`              |
| Private functions  | \_prefixed             | `_hasFileExtension`            |
| Options interfaces | Options or descriptive | `BreadcrumbOptions`            |
| Default options    | defaultOptions         | `const defaultOptions = {...}` |

### TypeScript Patterns

#### Branded Types for Type Safety

```typescript
// Use branded types to prevent mixing incompatible strings
type SlugLike<T> = string & { __brand: T }
export type FilePath = SlugLike<"filepath">
export type FullSlug = SlugLike<"full">
```

#### Type Guards

```typescript
export function isFilePath(s: string): s is FilePath {
  // validation logic
}
```

#### Union Types for Configuration

```typescript
export type Analytics =
  | null
  | { provider: "plausible"; host?: string }
  | { provider: "google"; tagId: string }
```

#### Generic Plugin Types

```typescript
export type QuartzTransformerPlugin<Options extends OptionType = undefined> = (
  opts?: Options,
) => QuartzTransformerPluginInstance
```

### Error Handling

#### Try-Catch for Validation

```typescript
export function isAbsoluteURL(s: string): boolean {
  try {
    new URL(s)
  } catch {
    return false
  }
  return true
}
```

#### Use trace() for Fatal Errors

```typescript
import { trace } from "./util/trace"

try {
  return await buildQuartz(argv, mut, clientRefresh)
} catch (err) {
  trace("\nExiting Quartz due to a fatal error", err as Error)
}
```

### Component Patterns (Preact/JSX)

```typescript
export default ((opts?: Partial<BreadcrumbOptions>) => {
  const options: BreadcrumbOptions = { ...defaultOptions, ...opts }

  const Breadcrumbs: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
    ctx,
  }: QuartzComponentProps) => {
    return (
      <nav class={classNames(displayClass, "breadcrumb-container")} aria-label="breadcrumbs">
        {/* content */}
      </nav>
    )
  }

  Breadcrumbs.css = breadcrumbsStyle
  return Breadcrumbs
}) satisfies QuartzComponentConstructor
```

### Plugin Patterns

```typescript
export const CrawlLinks: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  return {
    name: "LinkProcessing",
    htmlPlugins(ctx) {
      return [
        () => (tree: Root, file) => {
          /* transform logic */
        },
      ]
    },
  }
}
```

## Testing Guidelines

### Test Structure

```typescript
import test, { describe, beforeEach } from "node:test"
import assert from "node:assert"

describe("category", () => {
  test("should do something", () => {
    assert.strictEqual(actual, expected)
    assert.deepStrictEqual(obj1, obj2)
    assert(condition)
  })

  beforeEach(() => {
    // setup
  })
})
```

### Test File Locations

- `quartz/util/path.test.ts`
- `quartz/util/fileTrie.test.ts`
- `quartz/components/scripts/search.test.ts`

## Project Structure

```
quartz/
├── content/              # Markdown content (Obsidian vault)
├── quartz/               # Core framework code
│   ├── components/       # Preact components (.tsx)
│   ├── plugins/          # Transformers, filters, emitters
│   │   ├── transformers/
│   │   ├── filters/
│   │   └── emitters/
│   ├── processors/       # Parse, filter, emit processors
│   ├── util/             # Utility functions
│   ├── i18n/             # Internationalization
│   ├── build.ts          # Build orchestration
│   └── cfg.ts            # Configuration types
├── quartz.config.ts      # User configuration
├── quartz.layout.ts      # Layout configuration
└── package.json
```

## Important Notes

1. **JSX Runtime**: Uses Preact (`jsxImportSource: "preact"`), not React
2. **Strict TypeScript**: `noUnusedLocals` and `noUnusedParameters` are enabled
3. **ES Modules**: All imports/exports use ESM syntax
4. **Node Version**: Requires Node.js >= 22
