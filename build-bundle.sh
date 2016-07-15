#!/bin/sh

echo Creating the bundle
browserify -s homebridge index.js > homebridge-firebase-common.bundle.js
echo DONE
