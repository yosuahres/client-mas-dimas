# CI, deploy and Docker

## Git hooks (Husky)

`pnpm install` sets the hooks up. Nothing else to do.

| Hook | What runs | Why |
| --- | --- | --- |
| `pre-commit` | ESLint on the staged files (`lint-staged`), with auto-fix | Fast: only what you are committing |
| `commit-msg` | commitlint | Keeps the `feat(admin): ...` style the history already uses |
| `pre-push` | `pnpm typecheck` | The whole project, a few seconds |

Skip once with `git commit --no-verify` or `HUSKY=0 git push`.

## CI (`.github/workflows/ci.yml`)

Runs on every pull request and every push to `main`:

1. **Lint, typecheck, build**: `pnpm lint`, `pnpm typecheck`, `pnpm build`.
2. **Docker image builds**: `docker build`, to catch a broken Dockerfile. Nothing is pushed.
3. **Deploy to cPanel**: only on `main`, only after step 1 passes, and only when it is switched on (below).

Add these under **GitHub → Settings → Secrets and variables → Actions → Secrets**, so the build has the same public values as the live site:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Without them CI still passes; the build just uses the built-in content.

## Deploy to cPanel

The deploy job uploads the `standalone` build over SSH with rsync, then asks Passenger to restart the app. It is off until the hosting exists.

One-time setup:

1. **cPanel → Setup Node.js App → Create application**: Node 22, application root e.g. `jogja-travel`, startup file `server.js`. Add the environment variables from `.env.example` there, plus `NODE_ENV=production`.
2. **cPanel → SSH Access**: create a key pair without a passphrase for deploys, and authorize it. The host must allow SSH and have `rsync` (ask support if unsure).
3. In GitHub, add **secrets**:
   - `SSH_HOST`: the server hostname
   - `SSH_USER`: the cPanel username
   - `SSH_PRIVATE_KEY`: the private key from step 2
   - `SSH_PORT`: only if it is not 22
   - `SSH_KNOWN_HOSTS`: the output of `ssh-keyscan -p <port> <host>`, run once from a network you trust; pins the server's identity, so the deploy refuses to talk to anything else. If the host changes its key, update this secret.
4. Add **variables** (same page, Variables tab):
   - `DEPLOY_PATH`: full path of the application root, e.g. `/home/<user>/jogja-travel`
   - `DEPLOY_ENABLED`: `true`

From then on every push to `main` that passes the checks goes live. To redeploy without a new commit: **Actions → CI → Run workflow**.

The upload replaces everything in the application root except `tmp/`, `.env*`, `.htaccess` and `stderr.log`. Don't keep other files there.

The build runs on Ubuntu with Node 22. Photo resizing (`sharp`) ships a Linux x64 binary that needs a reasonably recent server OS; if images break on a very old CloudLinux, check `stderr.log` in the application root.

## Docker

For running the site anywhere that is not cPanel (a VPS, or a local production-like run).

```bash
docker build -t jogja-travel \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx \
  .

docker run --rm -p 3000:3000 --env-file .env jogja-travel
```

The two `NEXT_PUBLIC_` values go in at build time because they end up in the browser bundle. The secret keys are only read at run time, from `--env-file`, and are never copied into the image (`.dockerignore` keeps `.env*` out).
