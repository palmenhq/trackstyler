#!/usr/bin/env bash

set -xeuo pipefail

source_html="${1:-"dist/index.html"}"
target_root_dir="${2:-"dist"}"

if [[ ! -f "${source_html}" ]]; then
  echo "Target html file \"${source_html}\" not found" >&2
  exit 1
fi

if [[ ! -d "${target_root_dir}" ]]; then
  echo "Target dist directory \"${target_root_dir}\" not found" >&2
  exit 1
fi

mkdir -p "${target_root_dir}/tool"
cp "${source_html}" "${target_root_dir}/tool/index.html"
