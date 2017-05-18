#!/bin/sh

export NODE_PATH=$(dirname $0)/runtime/node_modules:$NODE_PATH
exec node $(dirname $0)/twilio-runtime-utils.js "$@"
