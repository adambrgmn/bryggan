#!/usr/bin/env bash

npx esbuild \
  --bundle \
  --target=es2020 \
  --outfile=./public/vendor/pdf.worker.js \
  --sourcemap \
  --minify \
  ./node_modules/pdfjs-dist/build/pdf.worker.entry.js
