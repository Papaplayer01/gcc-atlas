#!/usr/bin/env bash
# One-command deploy. Needs git and the GitHub CLI (https://cli.github.com), logged in with: gh auth login
set -e
REPO="${1:-gcc-atlas}"
[ -d .git ] || git init -b main
git add .
git commit -m "GCC Atlas case study" || true
gh repo create "$REPO" --public --source=. --remote=origin --push
OWNER="${GH_OWNER:-papaplayer01}"
# Turn on GitHub Pages and let the workflow in .github/workflows deploy it.
gh api --method POST "repos/$OWNER/$REPO/pages" -f build_type=workflow || gh api --method PUT "repos/$OWNER/$REPO/pages" -f build_type=workflow
gh workflow run pages.yml || true
echo
echo "Done. In a minute or two your site will be live at:"
echo "  Landing page: https://$OWNER.github.io/$REPO/"
echo "  Deck:         https://$OWNER.github.io/$REPO/deck/"
echo "  Prototype:    https://$OWNER.github.io/$REPO/prototype/"
echo "Watch progress with: gh run watch"
