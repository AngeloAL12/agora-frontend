# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

**Development server:**

```bash
npm run start
```

**Common scripts:**

- `npm run test` — Run Jest tests
- `npm run test:watch` — Watch mode for tests
- `npm run lint` — Check code with ESLint
- `npm run lint:fix` — Auto-fix lint issues
- `npm run format` — Format with Prettier
- `npm run android` / `npm run ios` / `npm run web` — Run on specific platform

**Single test file:**

```bash
npm test -- __tests__/app/index.test.tsx
```

## Project Architecture

**Technology Stack:**

- **Framework:** Expo 54 + React Native 0.81 with React 19
- **Routing:** Expo Router (file-based routing in `app/` directory)
- **Language:** TypeScript (strict mode)
- **Testing:** Jest + Testing Library React Native
- **Code Quality:** ESLint (expo config) + Prettier + Husky hooks

**Directory Structure:**

- `app/` — Screen components and routes (Expo Router file-based routing)
  - `_layout.tsx` — Root layout wrapper that initializes fonts
  - `index.tsx` — Home screen
- `__tests__/` — Test files (Jest), mirroring `app/` structure
- `constants/` — Theme colors, typography, and font definitions
  - `theme.ts` — Color palette and design tokens (exported as `theme` object)
  - `fonts.ts` — Font file imports and font family constants
- `hooks/` — Custom React hooks (e.g., `useFonts` for font loading)
- `styles/` — Global styling utilities
- `assets/` — Images and fonts

**Key Files:**

- `app/_layout.tsx:4` — Root layout uses `useAppFonts()` hook to load fonts before rendering
- `constants/theme.ts` — Central theme object with colors and typography
- `constants/fonts.ts` — Font configuration mapping font family names to .ttf files

## Code Quality & Git Hooks

The project uses **Husky** with automated hooks:

- **pre-commit:** Runs `eslint --fix` on changed `.{js,ts,tsx}` files via lint-staged
- **commit-msg:** Validates commit messages with commitlint (conventional commits)
- **pre-push:** Runs full test suite (`npm test`)

Coverage thresholds (enforced in `package.json`):

- Branches: 70%
- Functions: 70%
- Lines: 80%
- Statements: 70%

Reports generated in `coverage/` directory.

## Testing Patterns

Tests use `@testing-library/react-native` and Jest. Example test structure in `__tests__/app/index.test.tsx`:

```typescript
import { render } from '@testing-library/react-native';
import Index from '../../app/index';

describe('Index Screen', () => {
  it('renders text correctly', () => {
    const { getByText } = render(<Index />);
    expect(getByText('Animo!')).toBeTruthy();
  });
});
```

## TypeScript Configuration

- **Path alias:** `@/*` resolves to project root (configured in `tsconfig.json`)
- **Strict mode:** Enabled for type safety
- **Base config:** Extends `expo/tsconfig.base`

Use imports like: `import theme from '@/constants/theme'`

## Theme Usage

Access design tokens from `@/constants/theme`:

```typescript
import theme from '@/constants/theme';

// Colors: theme.colors.bluePrimary, theme.colors.yellow, etc.
// Palette: theme.palette.background, theme.palette.textPrimary, etc.
// Typography: theme.typography.fontFamily.interRegular, etc.
```

## Troubleshooting

**Metro bundler issues:**

```bash
npx expo start -c
```

**Native dependencies changed:** Restart emulator/simulator and `npm run start`.

**Fonts not loading:** Ensure fonts are in `assets/fonts/` and registered in `constants/fonts.ts`.

## Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add new feature`
- `fix: fix bug`
- `test: add tests`
- `refactor: refactor code`
- `docs: update docs`
- `chore: maintenance`

Validated by `@commitlint/config-conventional` in pre-commit hook.
