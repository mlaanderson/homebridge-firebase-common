@echo off

SET MINIFY=1
SET MANGLE=1

:loop
IF NOT "%1"=="" (
    if "%1"=="--no-min" (
        SET MINIFY=0
    )
    if "%1"=="--no-mangle" (
        SET MANGLE=0
    )
    if "%1"=="--debug" (
        SET MINIFY=0
        SET MANGLE=0
    )
    shift
    GOTO :loop
)

echo Creating the bundle
IF "%MINIFY%%MANGLE%"=="00" (
    browserify -s homebridge index.js > homebridge-firebase-common.bundle.js
) ELSE (
    IF "%MINIFY%"=="0" (
        browserify -s homebridge index.js | uglifyjs --mangle -- - > homebridge-firebase-common.bundle.js
    ) ELSE (
        IF "%MANGLE%"=="0" (
            browserify -s homebridge index.js | uglifyjs --compress -- - > homebridge-firebase-common.bundle.js
        ) ELSE (
            browserify -s homebridge index.js | uglifyjs --mangle --compress -- - > homebridge-firebase-common.bundle.js
        )
    )
)
echo DONE
