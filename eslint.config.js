// @ts-check
/**
 * ESLint flat config.
 *
 * Beyond the recommended sets, these rules enforce principles that would
 * otherwise be kept by discipline alone. Each rule block names the
 * principle (PRINCIPLES.md) it encodes.
 */
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import vitest from '@vitest/eslint-plugin'
import { defineConfig } from 'eslint/config'

/**
 * Principle 2 module boundaries: generation knows nothing of WebGL or the
 * panel; render consumes structure but never reaches into the panel; ui
 * edits parameters but never draws.
 */
function moduleBoundary(dir, banned) {
  return {
    files: [`src/${dir}/**/*.ts`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: banned.map(({ group, message }) => ({ group, message })),
        },
      ],
    },
  }
}

export default defineConfig(
  { ignores: ['dist/**', 'node_modules/**', '**/*.{js,mjs,cjs}'] },
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ['vite.config.ts'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        { considerDefaultExhaustiveForUnions: true, requireDefaultForNonUnion: false },
      ],
      // CLAUDE.md: breaking changes are fine; no deprecated paths.
      '@typescript-eslint/no-deprecated': 'error',
      'no-debugger': 'error',
    },
  },

  // ---------------------------------------------------------------
  // Principle 2: generation and rendering are separate.
  // ---------------------------------------------------------------
  moduleBoundary('generation', [
    { group: ['**/render', '**/render/**', 'twgl.js'], message: 'Principle 2: generation produces structure and knows nothing of WebGL.' },
    { group: ['**/ui', '**/ui/**', 'tweakpane'], message: 'Principle 2: generation is driven by explicit parameters, not by the panel.' },
  ]),
  moduleBoundary('render', [
    { group: ['**/ui', '**/ui/**', 'tweakpane'], message: 'Principle 2: render consumes structure; it does not touch the control panel.' },
  ]),
  moduleBoundary('ui', [
    { group: ['**/render', '**/render/**', 'twgl.js'], message: 'Principle 2: ui edits parameters and seeds; it does not draw.' },
  ]),

  // ---------------------------------------------------------------
  // Principles 1 and 3: pure generation, determinism by seed. Entropy
  // enters only as a seed passed in from outside generation (ui/'s
  // new-seed button is the one place that draws one).
  // ---------------------------------------------------------------
  {
    files: ['src/generation/**/*.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Principle 3: randomness comes from an explicit seed (generation/rng.ts).' },
        { object: 'Date', property: 'now', message: 'Principle 1: time is a passed-in parameter, not ambient.' },
        { object: 'performance', property: 'now', message: 'Principle 1: time is a passed-in parameter, not ambient.' },
        { object: 'crypto', property: 'getRandomValues', message: 'Principle 3: randomness comes from an explicit seed.' },
      ],
      'no-restricted-globals': [
        'error',
        ...['window', 'document', 'navigator', 'localStorage', 'sessionStorage', 'requestAnimationFrame'].map((name) => ({
          name,
          message: 'Principle 1: generation is pure; no browser globals.',
        })),
      ],
      'no-restricted-syntax': [
        'error',
        { selector: "NewExpression[callee.name='Date']", message: 'Principle 1: time is a passed-in parameter, not ambient.' },
      ],
    },
  },

  // ---------------------------------------------------------------
  // Tests protect behaviour: no focused or skipped tests, every test
  // asserts.
  // ---------------------------------------------------------------
  {
    files: ['src/**/*.test.ts'],
    plugins: { vitest },
    rules: {
      'vitest/no-focused-tests': 'error',
      'vitest/no-disabled-tests': 'error',
      'vitest/expect-expect': 'error',
      'no-console': 'error',
    },
  },
)
