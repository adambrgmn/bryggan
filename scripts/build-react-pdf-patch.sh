#!/usr/bin/env bash

npx esbuild \
  --bundle \
  --target=es2020 \
  --format=esm \
  --external:react \
  --external:react-dom \
  --allow-overwrite \
  --outfile=./node_modules/react-pdf/dist/esm/entry.js \
  ./node_modules/react-pdf/src/entry.js
