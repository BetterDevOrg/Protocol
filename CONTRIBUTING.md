# Contributing to BetterDev

Thank you for your interest in BetterDev. This project is open source and we welcome contributions from the community.

## Maintainers

| Maintainer | GitHub |
|------------|--------|
| Frankeze | [@FrankezeCode](https://github.com/FrankezeCode) |
| Ruth | [@BetterRuth](https://github.com/BetterRuth) |

The repository is hosted under the [BetterDevOrg](https://github.com/BetterDevOrg) organization.

## Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## Ways to contribute

- Report bugs or suggest features via [GitHub Issues](https://github.com/BetterDevOrg/protocol/issues)
- Improve documentation
- Fix bugs or add tests
- Work on issues labeled **`good first issue`** (first-time contributors to this repo — see below)
- Explore [internship project tracks](docs/INTERNSHIP-PROJECTS.md)

## Issue assignment & fairness

We want contributions to stay transparent, fair, and welcoming — especially for newcomers.

### Who should pick up `good first issue`?

Issues labeled **`good first issue`** are reserved for **first-time contributors to this repository** (no merged PRs yet). If you've already contributed here, please choose issues without that label, or help with reviews and docs.

### How to claim an issue

1. Find an open issue you'd like to work on.
2. Comment on the issue: **"I'd like to work on this."**
3. A maintainer will assign you for a **48-hour window**.
4. Within 48 hours, open a **PR or draft PR** and link it in the issue.
5. If no PR is linked in time, the issue may be unassigned and opened to others.

### One task at a time

Please work on **one active issue at a time**. Finish or release your claim before starting another.

### Unsolicited pull requests

Opening a PR without claiming the issue first is discouraged — it can lead to duplicate work.

- If multiple PRs exist for the same issue, maintainers will typically **review the first valid PR** that meets the acceptance criteria.
- To avoid wasted effort, **always comment to claim before you start coding.**

### Duplicate work

If someone else is already assigned or has an open PR for an issue, please do not open a competing PR for the same scope. Check the issue comments and linked PRs first.

## Development setup

1. Fork the repository and clone your fork:

   ```bash
   git clone https://github.com/BetterDevOrg/protocol.git
   cd protocol
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the environment template and fill in values locally:

   ```bash
   cp .env.example .env.local
   ```

   Never commit `.env.local` or any secrets.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Useful commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run contracts:compile` | Compile Solidity contracts |
| `npm run contracts:test` | Run Hardhat tests |

## Pull request process

1. **Comment on the issue to claim it** (see [Issue assignment & fairness](#issue-assignment--fairness)), then open your PR within 48 hours. For small drive-by fixes (typos), a linked issue is still appreciated but not always required.
2. Create a branch from `main`: `feat/short-description` or `fix/short-description`.
3. Keep pull requests focused — one feature or fix per PR.
4. Run `npm run build` and, for contract changes, `npm run contracts:test`.
5. Fill out the PR description with what changed and how to test it.

## Code style

- Match existing patterns in the codebase.
- Prefer minimal, focused diffs over large refactors.
- Do not add `NEXT_PUBLIC_` prefixes to secrets or private keys.

## Adding early contributors to the landing carousel

Early contributors shown on the landing page carousel are defined in `src/lib/early-contributors.ts`.

### How to add a contributor

1. Open `src/lib/early-contributors.ts`.
2. Add a new entry to the `EARLY_CONTRIBUTORS` array. Each entry has two fields:
   - `name` — the display name shown on the carousel card
   - `github` — the contributor's GitHub username (without the `@`)

   ```ts
   export const EARLY_CONTRIBUTORS: EarlyContributor[] = [
     // ...existing entries...
     { name: "Jane Doe", github: "janedoe" },
   ];
   ```

3. That's it — **no image upload is needed**. Avatars load automatically from GitHub's CDN via the `githubAvatarUrl()` helper, which builds an `https://avatars.githubusercontent.com/<username>` URL from the `github` field.

### Notes

- `avatars.githubusercontent.com` must stay allowed in the image configuration in `next.config.mjs`. Do not remove it, or carousel avatars will stop loading.
- The new avatar appears on the carousel after the change is deployed.

## Security

If you discover a security vulnerability, **do not** open a public issue. Contact the maintainers directly for responsible disclosure.

## Questions

Open a [GitHub Issue](https://github.com/BetterDevOrg/protocol/issues) with the `question` label, or reach out to a maintainer.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
