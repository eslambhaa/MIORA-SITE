# Testing

- Framework: Vitest 5 with jsdom, React Testing Library, jest-dom (versions pinned in `package.json`).
- Run all: `npm test`. Watch while developing: `npx vitest`.
- Tests sit next to the file they cover: `name.test.js` or `name.test.jsx` under `src/`. Shared setup is `src/test/setup.js`.
- Layers: unit tests for pure logic (`src/lib`, `src/auth`); component tests with Testing Library for UI behaviour; browser checks (Playwright with mocked Supabase replies) are done by hand per phase and are not part of `npm test`.
- Conventions: `describe` per function, `it.each` for rule tables, one rule broken per case, no real network or Supabase calls (mock them), Cairo time cases pass an explicit `now`.
- Every bug fix gets a regression test; new functions get tests for both branches.
