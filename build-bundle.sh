#!/bin/bash

MINIFY=1
MANGLE=1
MINCMD="uglifyjs --mangle --compress -- -"

while [[ $# -ge 1 ]]
do
    key="$1"

    case ${key} in
        --no-min)
            MINIFY=0
            ;;
        --no-mangle)
            MANGLE=0
            ;;
        --debug)
            MINIFY=0
            MANGLE=0
            ;;
        *)
            echo Usage: $0 [--no-min][--no-mangle]
            exit 1
        ;;
    esac
    shift
done

if [[ ${MINIFY} -eq 1 && ${MANGLE} -eq 1 ]]; then
    echo "Already set" >> /dev/null
elif [[ ${MINIFY} -eq 1 ]]; then
    MINCMD="uglifyjs --compress -- -"
elif [[ ${MANGLE} -eq 1 ]]; then
    MINCMD="uglifyjs --mangle -- -"
else
    MINCMD="cat -"
fi

echo Creating the bundle
browserify -s homebridge index.js | ${MINCMD} > homebridge-firebase-common.bundle.js
echo DONE
