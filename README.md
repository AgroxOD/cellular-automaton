# Cellular Automaton

Scaffolded with Vite + React + TypeScript. Includes a Three.js scene rendering a rotating dodecahedron with spheres on its vertices.

## Requirements
- Node.js 20.19 or newer (or >=22.12)

## Scripts
- `pnpm install` installs dependencies.
- `pnpm run dev` starts a development server at http://localhost:5173.
- `pnpm build` builds the production bundle.

## Hotkeys
No keyboard shortcuts are implemented; use the Start/Stop and Step buttons in the UI.

## Rule format
Rules use two comma-separated lists of neighbor counts:

- **Born** – numbers of neighbors that cause a dead cell to become alive
- **Survive** – numbers that keep a living cell alive

Each entry must be an integer from 0–12. Invalid values are ignored and mark the input invalid. Duplicates are removed and the
remaining numbers are sorted. See [`src/ruleParser.ts`](src/ruleParser.ts) and its tests in [`src/parseRule.test.ts`](src/parseRule.test.ts).

## Neighbor generators
The simulation includes several neighbor layouts:

- [`generateIcosahedronNeighbors`](src/ca.ts) – 12 vertices with 5 neighbors each
- [`generateDodecahedronNeighbors`](src/ca.ts) – 20 vertices with 3 neighbors each
- [`generateFCCLattice`](src/ca.ts) – cubic lattice with 12 neighbors per interior cell and a configurable radius

All generators guarantee symmetric neighbor lists in deterministic order. Tests reside in [`src/ca.test.ts`](src/ca.test.ts).

## Deployment
### Vercel
The latest build is deployed at https://cellular-automaton.vercel.app.

### GitHub Pages
To deploy on GitHub Pages:
1. Run `pnpm lint`, `pnpm test` and `pnpm build`.
2. The build output is written to the `docs/` directory.
3. Commit and push `docs/` to `main` and configure Pages to serve from that folder.

## References
- Platonic solids: https://en.wikipedia.org/wiki/Platonic_solid
- Three.js: https://threejs.org/docs/
- Vite: https://vite.dev/guide/
