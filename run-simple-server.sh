#!/usr/bin/env bash

appdir=survey-app

echo "Clear"
rm -rf $appdir

echo "Build static..."
npm run build

echo "Copy server to app"
cp -r server $appdir

echo "Move static to app public folder"
mv -f client/build/*  $appdir/public

echo "Your app folder: $appdir"