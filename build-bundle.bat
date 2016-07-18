@echo off

echo Creating the bundle
browserify -s homebridge index.js | uglifyjs --mangle --compress -- - > homebridge-firebase-common.bundle.js
echo DONE
