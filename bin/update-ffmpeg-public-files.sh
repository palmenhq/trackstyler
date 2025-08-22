#!/usr/bin/env bash

set -xeuo pipefail

cp ./node_modules/@ffmpeg/core-mt/dist/esm/ffmpeg-core.js ./public/fmpc.js
cp ./node_modules/@ffmpeg/core-mt/dist/esm/ffmpeg-core.worker.js ./public/fmpc.worker.js
cp ./node_modules/@ffmpeg/core-mt/dist/esm/ffmpeg-core.wasm ./public/fmpc.wasm

rm -rf ./public/fmp/
mkdir ./public/fmp
cp ./node_modules/@ffmpeg/ffmpeg/dist/esm/*.js ./public/fmp/

sed -i '' 's%export const CORE_URL =.*%export const CORE_URL="/fmpc.js"%' public/fmp/const.js
