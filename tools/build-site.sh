#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

rm -rf _site
mkdir -p _site
cp site/index.html _site/index.html
touch _site/.nojekyll

for book in users-manual programmers-reference mapping sdk-studio; do
  mdbook build "$book"
  mkdir -p "_site/$book"
  cp -R "$book/book/." "_site/$book/"
done
