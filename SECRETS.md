# GitHub Secrets Setup

## 1. NPM_TOKEN — npm publish access

Used by `.github/workflows/publish.yml` to publish `@bazileros/payfast`.

### Create the token

1. Go to https://www.npmjs.com/settings/[username]/tokens
2. Click **"Generate New Token"** → **"Granular Access Token"**

### Permissions (least-privilege)

| Setting | Value |
|---|---|
| **Token name** | `payfastt-publish` |
| **Scope** | `Packages and scopes` |
| **Package scope** | `@bazileros` |
| **Packages** | Only `@bazileros/payfast` |
| **Access** | `Read and write` (needed for `npm publish --provenance`) |
| **Expiration** | No expiration (or 1 year with calendar reminder) |

Do **NOT** select "Automation" token type — those can't publish scoped public packages.

### Add to GitHub

```bash
gh secret set NPM_TOKEN --repo bazileros/payfastt
# paste the token when prompted
```

Or via UI: repo Settings → Secrets and variables → Actions → New repository secret.

### Security notes (recent npm attacks)

- **Granular tokens** (not legacy) — scoped to a single package, so a leak can't touch other packages.
- **Read and write** on one package only — no `admin:public` or org-level access.
- **Do not** paste the token in terminals that log history. Use `gh secret set` or the UI.
- **Rotate** if you suspect compromise. Go back to npm tokens page and regenerate.
- **No `postinstall` scripts** in this package, but be aware: avoid adding scripts that fetch or eval at install time.
- **Provenance** (`npm publish --provenance`) signs the package with GitHub's OIDC token. This requires the workflow to have `id-token: write` permission and your npm account to have 2FA with `require` level set to "Authorization". This prevents tag-squatting and proves the package was built by your CI.

---

## 2. CLOUDFLARE_API_TOKEN — Cloudflare Pages & Workers deploy

Used by `.github/workflows/deploy-web.yml` and `.github/workflows/deploy-docs.yml`.

### Create the token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"** → **"Custom token"**

### Permissions

| Setting | Value |
|---|---|
| **Token name** | `payfastt-deploy` |
| **Permissions** → **Cloudflare Pages** | `Edit` |
| **Permissions** → **Cloudflare Workers** | `Edit` |
| **Account resources** | Your Cloudflare account |
| **Client IP filtering** | Optional: restrict to GitHub Actions IPs (`140.82.112.0/20`, `185.199.108.0/22`, etc.) |
| **TTL** | No expiration (or 1 year) |

### Add to GitHub

```bash
gh secret set CLOUDFLARE_API_TOKEN --repo bazileros/payfastt
```

### Security notes

- **Scope to "Edit" not "Admin"** — Admin can delete resources or change account settings.
- **IP filtering** recommended if your team deploys from known CI ranges only.
- Workers token is needed because docs deploy to Workers (SSR via `@astrojs/cloudflare`).

---

## 3. CONVEX_DEPLOY_KEY — Convex backend deploy

Used by `.github/workflows/deploy-convex.yml` to run `npx convex deploy`.

### Create the key

1. Go to https://dashboard.convex.dev → your project → **Settings → Deploy Keys**
2. Click **"Generate Key"**
3. Give it a name like `payfastt-github-actions`

### Permissions

- Deploy keys only have one level: they can deploy to the project. No finer scoping needed.

### Add to GitHub

```bash
gh secret set CONVEX_DEPLOY_KEY --repo bazileros/payfastt
```

### Security notes

- A deploy key can deploy to **one** Convex project. Create separate keys for staging/prod if you add them.
- Convex deploy keys don't expire. Rotate manually via the dashboard if you suspect a leak.

---

## 4. Verify secrets are set

```bash
gh secret list --repo bazileros/payfastt
```

Expected output (values hidden):

```
NPM_TOKEN            Updated ...
CLOUDFLARE_API_TOKEN Updated ...
CONVEX_DEPLOY_KEY    Updated ...
```

## 5. Testing before real publish

1. Push a tag **without a leading `v`** first to test the workflow dry-run:
   ```bash
   git tag test-0.2.0-rc1
   git push origin test-0.2.0-rc1
   ```
   `publish.yml` only triggers on `v*` tags, so this won't fire. Good.

2. When ready for real publish:
   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```
   This triggers `publish.yml` → `npm publish --provenance`.

3. Verify the package appears at https://www.npmjs.com/package/@bazileros/payfast
