#!/usr/bin/env bash
# build.sh — Build the full OpenStudio Coalition website locally.
#
# Usage:
#   ./build.sh             # build everything and copy to repo root
#   ./build.sh --docs      # build MkDocs only
#   ./build.sh --app       # build releases app only
#   ./build.sh --no-copy   # build both but skip copying to root
#
# Prerequisites:
#   - Python + pip (for MkDocs)
#   - Node.js + yarn (for releases app)
#   - openstudioreleases/firebase-config.json must exist

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BUILD_DOCS=true
BUILD_APP=true
COPY_TO_ROOT=true

for arg in "$@"; do
  case $arg in
    --docs)    BUILD_DOCS=true;  BUILD_APP=false  ;;
    --app)     BUILD_DOCS=false; BUILD_APP=true   ;;
    --no-copy) COPY_TO_ROOT=false                 ;;
  esac
done

# ── Helpers ──────────────────────────────────────────────────────────────────

info()    { echo "[INFO]  $*"; }
success() { echo "[OK]    $*"; }
error()   { echo "[ERROR] $*" >&2; exit 1; }

# ── Preflight checks ─────────────────────────────────────────────────────────

if $BUILD_APP; then
  if [ ! -f "$REPO_ROOT/openstudioreleases/firebase-config.json" ]; then
    error "openstudioreleases/firebase-config.json not found. See openstudioreleases/README.md."
  fi
fi

# ── Build MkDocs ─────────────────────────────────────────────────────────────

if $BUILD_DOCS; then
  info "Building MkDocs documentation..."
  cd "$REPO_ROOT/markdown_source"

  if ! command -v mkdocs &>/dev/null; then
    info "mkdocs not found — installing from requirements.txt..."
    pip install -r requirements.txt
  fi

  rm -rf site
  mkdocs build
  success "MkDocs built → markdown_source/site/"
fi

# ── Build releases app ───────────────────────────────────────────────────────

if $BUILD_APP; then
  info "Building releases app..."
  cd "$REPO_ROOT/openstudioreleases"

  if ! command -v yarn &>/dev/null; then
    error "yarn not found. Install it with: npm install -g yarn"
  fi

  yarn install --frozen-lockfile
  yarn build
  success "Releases app built → openstudioreleases/dist/"
fi

# ── Copy outputs to repo root ─────────────────────────────────────────────────

if $COPY_TO_ROOT; then
  cd "$REPO_ROOT"

  if $BUILD_DOCS; then
    info "Cleaning existing MkDocs output from root..."
    # Remove all files at root except protected dirs and files
    find . \(  \
      -name markdown_source  \
      -o -name app           \
      -o -name openstudioreleases \
      -o -name .git          \
      -o -name .gitignore    \
      -o -name README.md     \
      -o -name CNAME         \
      -o -name build.sh      \
    \) -prune -o -type f -print0 | xargs -0 rm -f

    info "Copying MkDocs output to root..."
    cp -R markdown_source/site/. .
    success "MkDocs output copied to root."
  fi

  if $BUILD_APP; then
    info "Copying releases app to root/app/..."
    rm -rf app
    cp -R openstudioreleases/dist/app .
    success "Releases app copied to root/app/."
  fi
fi

echo ""
success "Build complete."
if $COPY_TO_ROOT; then
  echo ""
  echo "  To preview locally, run:  npx http-server . -p 8080 -o"
fi
