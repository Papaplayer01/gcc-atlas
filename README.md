# GCC Atlas: India GCC ecosystem case study

A strategy deck and a working prototype for a single source of truth on India's Global Capability Centre ecosystem.

```
site/                 the website: landing page, deck/, prototype/ and deck.pdf
worker/               optional AI service for the live prototype
.github/workflows/    deploys site/ to GitHub Pages on every push
deploy.sh             one-command setup using the GitHub CLI
```

## 1. Put it live (about five minutes)

### Fastest: one command

Install git and the [GitHub CLI](https://cli.github.com), then in this folder:

```
gh auth login
./deploy.sh gcc-atlas
```

It creates the repository, pushes the code, turns on GitHub Pages and starts the deploy. Your link is printed at the end:


- Deck: `https://papaplayer01.github.io/gcc-atlas/deck/`
- Prototype: `https://papaplayer01.github.io/gcc-atlas/prototype/`

The landing page that links to both, plus a PDF of the deck, is at `https://papaplayer01.github.io/gcc-atlas/`.

On Windows run the script from Git Bash, or use the manual steps below.

### Without the command line

1. On GitHub choose **New repository**, name it `gcc-atlas`, make it **Public**, and create it empty.
2. Choose **uploading an existing file**, drag in everything from this folder (include the hidden `.github` folder), and commit.
3. Open **Settings**, then **Pages**. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Open the **Actions** tab. The "Deploy site to GitHub Pages" run starts by itself. When it turns green your links are live.

Every later push to `main` redeploys automatically.

## 2. What works on the live site right away

The deck, the PDF and the whole prototype work: sourced numbers, state incentives with confidence labels, the policy map, the savings calculator, compare, print and download, and the command palette.

The AI features (Extract, plain-English search, the brief writer) use simple keyword matching until you do step 3.

## 3. Optional: turn on the AI features on the live site

The prototype cannot hold an API key safely in the browser, so a tiny service sits between the page and the AI. It is free to host on Cloudflare Workers.

1. Create an API key at console.anthropic.com.
2. Open `worker/wrangler.toml` and set `ALLOWED_ORIGIN` to `https://papaplayer01.github.io`.
3. In the `worker` folder run:

   ```
   npx wrangler login
   npx wrangler secret put ANTHROPIC_API_KEY
   npx wrangler deploy
   ```

   The last command prints an address like `https://gcc-atlas-api.YOUR-NAME.workers.dev`.
4. Put that address in `site/config.js`:

   ```
   window.GCC_API = "https://gcc-atlas-api.YOUR-NAME.workers.dev";
   ```

5. Commit and push. The site redeploys with AI turned on.

Notes: calls cost money on your API account, so set a spending limit in the console. The service only accepts short prompts from your site's address. If the model name is rejected, set `MODEL` in `wrangler.toml` to a current model from the Anthropic docs.

## About the data

Market figures come from nasscom–Zinnov and other sources linked in the prototype. State incentive terms come from secondary sources and none is verified against an official document yet. Registry rows, city scores, provider figures and pipeline signals are samples.
