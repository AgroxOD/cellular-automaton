# Cellular Automaton

Scaffolded with Vite + React + TypeScript. Includes a Three.js scene rendering a rotating dodecahedron with spheres on its vertices.

## Scripts
- `pnpm install` installs dependencies.
- `pnpm run dev` starts a development server at http://localhost:5173.
- `pnpm build` builds the production bundle.

## Hotkeys
No keyboard shortcuts are implemented; use the Start/Stop and Step buttons in the UI.

## Deployment
### Vercel
The latest build is deployed at https://cellular-automaton.vercel.app.

### GitHub Pages
To deploy on GitHub Pages:
1. Run `pnpm lint`, `pnpm test` and `pnpm build`.
2. Push the contents of the `dist/` directory to a `gh-pages` branch or the `docs/` folder.
3. Ensure assets use relative paths so that files resolve correctly.

## References
- Platonic solids: https://en.wikipedia.org/wiki/Platonic_solid
- Three.js: https://threejs.org/docs/
- Vite: https://vite.dev/guide/
