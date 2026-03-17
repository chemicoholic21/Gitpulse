
# GitPulse

**Project Intelligence for Open Source Contributors**

GitPulse computes a *contribution importance score* for any GitHub user — a single number that reflects not just how much someone contributes, but how much it *matters*. It works by analyzing merged pull requests across open source repositories and weighting them by the influence of those projects.

Standard GitHub profiles show activity. GitPulse shows impact.

---

## How the Score Works

The core formula is simple by design:

```
contribution_importance = stars × (user_merged_PRs / total_merged_PRs)
```

A PR merged into a 40,000-star repo counts for more than ten merged into projects nobody uses. Repos under 10 stars are excluded, and per-repo scores are capped at 10,000 to prevent a single viral project from dominating the picture.

**Score levels:**

| Score | Level |
|-------|-------|
| < 10 | Newcomer |
| 10 – 99 | Contributor |
| 100 – 499 | Active Contributor |
| 500 – 1,999 | Core Contributor |
| 2,000+ | Open Source Leader |

---

## Stack

GitPulse is built on Next.js 16 (App Router) with a dark terminal aesthetic.

- **Database** — Neon (serverless Postgres) via Drizzle ORM
- **Cache & rate limiting** — Upstash Redis
- **Auth** — NextAuth.js v5 with GitHub OAuth
- **Charts** — Recharts
- **Styling** — Tailwind CSS

---

## Running Locally

**Prerequisites:** Node.js 20+, a GitHub account, a [Neon](https://neon.tech) project, and an [Upstash](https://upstash.com) Redis database.

**1. Clone and install**

```bash
git clone https://github.com/chemicoholic21/gitpulse.git
cd gitpulse
npm install
```

**2. Configure environment**

Copy `.env.example` to `.env.local` and fill in your credentials:

```env
# GitHub OAuth
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Neon (Postgres)
DATABASE_URL="postgresql://..."

# Upstash (Redis)
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# GitHub PAT pool (add more as needed)
GITHUB_TOKEN_1="ghp_..."
```

**3. Push the schema**

```bash
npm run db:push
```

**4. Start the dev server**

```bash
npm run dev
```

---

## Deploying to Vercel

**Neon (database)**

Create a project, grab the pooled connection string, and run `npm run db:push` locally against it to sync the schema before deploying.

**Upstash (cache)**

Create a Redis database and copy the `REST_URL` and `REST_TOKEN`. You can optionally configure a global rate limit window from the Upstash console.

**GitHub OAuth**

Go to *Settings → Developer Settings → OAuth Apps* and create a new app:

- Homepage URL: `https://gitpulse-one.vercel.app`
- Callback URL: `https://gitpulse-one.vercel.app/api/auth/callback/github`

**Vercel**

Import the repo, add all `.env.local` variables to the project's environment settings (make sure `NEXTAUTH_URL` points to your production domain), and deploy.

---

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the **MIT License** — you're free to use, copy, modify, merge, publish, distribute, sublicense, or sell copies of this software, with one condition: the original copyright notice and this permission notice must be included in all copies or substantial portions of the software.

> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

See the full license text in [LICENSE](./LICENSE).
```

And the standalone `LICENSE` file itself:
```
MIT License

Copyright (c) 2026 Taniya Souza

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
