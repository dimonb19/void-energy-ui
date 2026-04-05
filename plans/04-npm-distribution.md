# 04 — NPM Distribution

> Publishing strategy for public and private packages across the Void Energy ecosystem.

**Status:** Planning — Wave 1 (public npm) / Wave 3 (private registry)
**Depends on:** 01-public-repo (Wave 1)
**Blocks:** Launch (public npm only needed for Wave 1; private registry deferred to Wave 3)

---

## Overview

Two registries, two scopes:

| Package | Registry | Scope | Access |
|---------|----------|-------|--------|
| `void-energy` | **public npm** (registry.npmjs.org) | unscoped | Anyone |
| `@dgrslabs/void-energy-*` | **private** (GitHub Packages or Verdaccio) | `@dgrslabs` | Licensed users only |

---

## Public Package: `void-energy`

### Publishing to npm

**Registry:** `https://registry.npmjs.org`
**Package name:** `void-energy`
**License:** BUSL-1.1

### Setup
1. Create an npm account or org at npmjs.com
2. Reserve the `void-energy` package name (`npm init` + `npm publish --dry-run`)
3. Generate an npm access token (Automation type for CI)
4. Store as `NPM_TOKEN` secret in the GitHub repo

### Publishing Workflow
```yaml
# void-energy/.github/workflows/publish.yml
name: Publish to npm
on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build:tokens
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Versioning
- Follow semver: `MAJOR.MINOR.PATCH`
- Pre-1.0: `0.x.y` — minor bumps can include breaking changes
- Post-1.0: breaking changes require major bump
- Use conventional commits for changelog generation

### Release Process
1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a git tag: `git tag v0.1.0`
4. Push tag: `git push origin v0.1.0`
5. Create GitHub release (triggers publish workflow)

---

## Private Packages: `@dgrslabs/*`

### Option A: GitHub Packages (Recommended to Start)

**Registry:** `https://npm.pkg.github.com`
**Cost:** Free (included with GitHub)
**Friction:** Consumers need a GitHub PAT

#### Setup (Publisher — Premium Repo)

1. Ensure each package's `package.json` includes:
```json
{
  "name": "@dgrslabs/void-energy-ambience",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

2. Repository `.npmrc`:
```ini
@dgrslabs:registry=https://npm.pkg.github.com
```

3. GitHub Actions publish workflow:
```yaml
# void-energy-premium/.github/workflows/publish.yml
name: Publish Premium Packages
on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      packages: write
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@dgrslabs'
      - run: npm ci
      - run: npm run build --workspaces
      - run: npm publish --workspaces
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### Setup (Consumer — CoNexus Repo)

1. Create a GitHub Personal Access Token with `read:packages` scope
2. Add `.npmrc` to the consumer repo:
```ini
@dgrslabs:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```
3. Set `GITHUB_TOKEN` in the environment (local dev) or as a CI secret

#### Customer Onboarding
For licensed customers who want to install premium packages:
1. Grant them read access to the `void-energy-premium` repo (or use a dedicated team)
2. They create a PAT with `read:packages` scope
3. They add the `.npmrc` configuration above
4. They can `npm install @dgrslabs/void-energy-ambience` (or other premium packages)

**Pros:**
- Zero cost
- Integrated with GitHub (same place as repos)
- GitHub Actions has built-in authentication

**Cons:**
- Consumers need GitHub account + PAT
- Slightly more friction for non-GitHub users
- Package visibility tied to repo visibility

---

### Option B: Verdaccio (Self-Hosted)

**Registry:** `https://npm.yourdomain.com` (your server)
**Cost:** Server hosting (you already have infrastructure)
**Friction:** Setup, but smoother for customers

#### Setup (Server)

1. Deploy Verdaccio as a Docker container:
```yaml
# docker-compose.yml
services:
  verdaccio:
    image: verdaccio/verdaccio:6
    ports:
      - "4873:4873"
    volumes:
      - verdaccio-storage:/verdaccio/storage
      - verdaccio-conf:/verdaccio/conf
    environment:
      - VERDACCIO_PORT=4873
volumes:
  verdaccio-storage:
  verdaccio-conf:
```

2. Configure Verdaccio (`config.yaml`):
```yaml
storage: /verdaccio/storage
auth:
  htpasswd:
    file: /verdaccio/conf/htpasswd
    max_users: -1  # disable self-registration

uplinks:
  npmjs:
    url: https://registry.npmjs.org/

packages:
  '@dgrslabs/*':
    access: $authenticated
    publish: $authenticated
    # No uplink — these are private-only

  '**':
    access: $all
    proxy: npmjs

middlewares:
  audit:
    enabled: true

listen:
  - 0.0.0.0:4873
```

3. Put behind HTTPS reverse proxy (nginx/Caddy) at `npm.yourdomain.com`

4. Create user accounts:
```bash
npm adduser --registry https://npm.yourdomain.com
```

#### Setup (Publisher)

1. `.npmrc` in premium repo:
```ini
@dgrslabs:registry=https://npm.yourdomain.com
//npm.yourdomain.com/:_authToken=${VERDACCIO_TOKEN}
```

2. Publish: `npm publish --workspaces`

#### Setup (Consumer)

1. `.npmrc`:
```ini
@dgrslabs:registry=https://npm.yourdomain.com
//npm.yourdomain.com/:_authToken=${VERDACCIO_TOKEN}
```

2. Customer gets a Verdaccio account (you create it for them)

**Pros:**
- Full control over access and data
- No GitHub dependency for customers
- Cleaner UX (standard npm auth)
- Can proxy public npm (acts as a cache too)

**Cons:**
- Server setup and maintenance
- Need HTTPS + domain
- Need user management solution

---

## Recommendation

**Start with GitHub Packages** (Option A):
- Zero cost, zero infrastructure
- You're already on GitHub
- Your initial customer base is small (CoNexus + maybe a few licensees)
- Adequate for the first 6-12 months

**Migrate to Verdaccio** (Option B) when:
- Customer count exceeds ~20
- Non-GitHub customers need access
- You want a more professional self-hosted solution
- You need custom access policies

The migration is non-breaking — just change `.npmrc` registry URLs and re-publish packages.

---

## Package Naming Convention

Premium collaborator packages follow this pattern:
```
@dgrslabs/void-energy-{feature}
```

| Package | Name | Status |
|---------|------|--------|
| Kinetic Text | `@dgrslabs/void-energy-kinetic-text` | First package — already built, move to premium repo |
| DGRS | `@dgrslabs/void-energy-dgrs` | Second package — 12 atmospheres + UI components, staging in monorepo |
| Ambience Layers | `@dgrslabs/void-energy-ambience` | Third package — build when CoNexus needs it |
| Rive assets (Eric Jordan) | `@dgrslabs/void-energy-rive` | Fourth package — pending Eric's delivery |
| Future collaborator packages | `@dgrslabs/void-energy-{name}` | As collaborators onboard |

**Note:** ALL packages start premium/private — strategic moat for CoNexus. Individual packages can be flipped to public npm independently (see Selective Publishing below). Premium deals with external customers are for later, after CoNexus launches.

---

## Selective Publishing — Per-Package Registry Control

The premium monorepo is private, but each package has its own `publishConfig` and can be published to a different registry independently. This enables flipping individual packages from private to public without affecting others.

### How It Works

```json
// Private package (default for all premium packages)
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "restricted"
  }
}

// Public package (flip when ready — one field change)
{
  "publishConfig": {
    "registry": "https://registry.npmjs.org",
    "access": "public"
  }
}
```

One monorepo, different registries per package. Change `publishConfig` on one package → that package publishes to public npm on next release. Other packages remain on GitHub Packages (private). The GitHub repo stays private regardless — consumers get the built package from npm but cannot browse source.

### Planned Timeline

| Package | Start | Future |
|---------|-------|--------|
| `@dgrslabs/void-energy-kinetic-text` | Private (GitHub Packages) | Revisit at 6-12 months post-CoNexus launch |
| `@dgrslabs/void-energy-dgrs` | Private (GitHub Packages) | Private forever (internal DGRS identity) |
| `@dgrslabs/void-energy-ambience` | Private (GitHub Packages) | Revisit when CoNexus has traction |
| `@dgrslabs/void-energy-rive` | Private (GitHub Packages) | **Public npm when Eric Jordan/Rive partnership materializes** |

### Source Visibility Options

When a package goes public on npm, consumers get the built files but the GitHub repo stays private (no source browsing, no issues, no PRs). Two options if source visibility is needed:

**Option A (default):** Private repo, public npm package. Simplest. Like GSAP — public npm, private source. Good enough for most commercial purposes.

**Option B (partnership):** Extract the package into its own public GitHub repo (e.g., `github.com/dgrslabs/void-energy-rive`). Source visible, community contributions possible, Rive team can showcase collaboration. More overhead, but better for partnership optics. Each premium package is self-contained (no cross-package imports), so extraction is straightforward.

---

## Version Coordination

Premium packages pin to a minimum `void-energy` version:
```json
{
  "peerDependencies": {
    "void-energy": ">=0.1.0"
  }
}
```

When `void-energy` makes a breaking change:
1. Publish new `void-energy` version
2. Update premium packages to work with new version
3. Bump premium package versions
4. Publish premium packages
5. Update CoNexus to use new versions

Use a compatibility matrix in the premium repo README:
```markdown
| Premium Version | Minimum void-energy |
|----------------|---------------------|
| 0.1.x          | 0.1.0               |
| 0.2.x          | 0.2.0               |
```

---

## Security Considerations

- **Never publish `.env` files or API keys** in packages
- **npm provenance** — enable for public package (proves it was built in CI)
- **Package signing** — consider for premium packages when available
- **Audit trail** — GitHub Packages logs all downloads; Verdaccio can too
- **Token rotation** — rotate PATs and npm tokens quarterly
- **`.npmrc` in `.gitignore`** — the file with tokens should not be committed (use environment variables instead)

---

## Verification Checklist

- [ ] `void-energy` publishes to public npm
- [ ] Package name `void-energy` is reserved on npmjs.com
- [ ] `@dgrslabs` npm scope is claimed (either npm org or GitHub org)
- [ ] Premium packages publish to chosen private registry
- [ ] Consumer can `npm install void-energy` from fresh project
- [ ] Consumer with auth can `npm install @dgrslabs/void-energy-kinetic-text`
- [ ] Consumer without auth gets a clear error (not a confusing 404)
- [ ] CI/CD pipelines publish on tagged releases
- [ ] Version coordination documented in premium repo
- [ ] Selective publishing works: one package can target public npm while others stay on GitHub Packages
- [ ] Per-package `publishConfig` verified with `npm publish --dry-run` on individual workspaces
