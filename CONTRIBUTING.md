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
- Work on issues labeled **`good first issue`**

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

1. Open an issue first (or comment on an existing one) for non-trivial changes.
2. Create a branch from `main`: `feat/short-description` or `fix/short-description`.
3. Keep pull requests focused — one feature or fix per PR.
4. Run `npm run build` and, for contract changes, `npm run contracts:test`.
5. Fill out the PR description with what changed and how to test it.

## Code style

- Match existing patterns in the codebase.
- Prefer minimal, focused diffs over large refactors.
- Do not add `NEXT_PUBLIC_` prefixes to secrets or private keys.

## Security

If you discover a security vulnerability, **do not** open a public issue. Contact the maintainers directly for responsible disclosure.

## Questions

Open a [GitHub Issue](https://github.com/BetterDevOrg/protocol/issues) with the `question` label, or reach out to a maintainer.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
