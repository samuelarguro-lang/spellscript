#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
archive_url='https://d2ol7oe51mr4n9.cloudfront.net/user_3MZi3Hq7CEiAgCIYxZGfcaEkT99/df0efe07-e770-47ae-8ce9-7a0b2d48e7a9.zip'
archive_sha='05f918d7dec2a0381ff1d516cd0968362ca9ed79679d1a57d9a0606eaf06d928'
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
curl -fL --retry 3 --max-time 180 "$archive_url" -o "$tmp/release.zip"
printf '%s  %s\n' "$archive_sha" "$tmp/release.zip" | sha256sum -c -
unzip -q "$tmp/release.zip" -d "$tmp"
target='.'
if [[ "${1:-}" == '--build' ]]; then
  rm -rf dist
  mkdir -p dist
  cp -a index.html css js assets vendor dist/
  target='dist'
fi
# Restore only media and bundled vendor files absent from Git.
while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  mkdir -p "$target/$(dirname "$file")"
  cp -a "$tmp/SpellScript_V9/$file" "$target/$file"
done < scripts/media-v9.txt
echo "Verified V9 media restored to $target"
