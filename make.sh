#!/bin/bash

rm -rf dist/
mkdir -v release/
npm run build
tar -czf release/finflow-release.tar.gz dist

