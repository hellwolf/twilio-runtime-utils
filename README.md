# Twilio Runtime Utils

This project is to create a set of utilities for developing twilio runtime based applications.

Twilio _Runtime_ is a Twilio Service where you could deploy _Functions_ and _Assets_ to develop your serverless applications. Twilio _Function_ is used to respond to Twilio Webhook events like an incoming phone call, inbound SMS or any other kinds of HTTP requests, such as returning Access Token for Twilio client SDK applications.

## Functionalities

### Implemented

* Define _function_ descriptor in YAML
* Support file inclusions for reusable components to _functions_
* Test  _functions_ locally
* Helper for writing unit tests for _functions_

### TODOs

* Deploy functions automatically (Need API support from _Twilio Runtime_)
* Define _Twilio Runtime_ descriptor, where _functions_ and _assets_ are defined

## Installation

1. Checkout repository `https://code.hq.twilio.com/zmiao/twilio-runtime-utils`

2. Build:

```
$ make build
```

This will install required npm modules for the utils.

3. Add directory of `twilio-runtime-utils` to `PATH`, after that you should be able to be able to run:

```
$ twilio-runtime-utils --help
usage: twilio-runtime-utils.js [-h] -c CONTEXT {run,runjson,deploy} ...

Twilio Runtime Utilities

Optional arguments:
  -h, --help            Show this help message and exit.
  -c CONTEXT, --context CONTEXT
                        global context for data that are deployment specific

commands:
  {run,runjson,deploy}
```

## Function Descriptor Example

```
type: function
name: Authenticator
description: |
  Generate short-term jwt token for admins to use UI application.
path: /authenticate
script: Authenticator.js
includes:
  - ../Common/Authorization.js
```

## Context Descriptor Example

Context are global configurations shared by all _functions_, it is defined in a YAML file too.

An example:
```
# webhook account detail
ACCOUNT_SID: AC00000000000000000000000000000000
API_KEY: SK00000000000000000000000000000000
API_SECRET: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# webhook handlers specific
SERVICE_SID: IS000000000000000000000000000000

# used by Authenticator
TOKEN_TTL: 3600 # in seconds
```

## Invoking Function locally

### Run function with event file

```
$ twilio-runtime-utils run --help
usage: twilio-runtime-utils.js run [-h] descriptor event

run function locally with test data files

Positional arguments:
  descriptor  function descriptor yaml
  event       test event yaml

Optional arguments:
  -h, --help  Show this help message and exit.

$ twilio-runtime-utils -c context-local.yaml run Authenticator/descriptor.yaml Authenticator/testdata/simple.yaml 

{ success: true,
  username: 'trump',
  ttl: 3600,
  token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzI2MzQ3MTM2N2E0OGI2Yjc4NjEyZTQyYzA5ZmFkNmI3LTE0OTU2MjgwMDMiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJ0cnVtcCIsImRhdGFfc3luYyI6eyJzZXJ2aWNlX3NpZCI6IklTYzg5NThjOGIzODNmZmM2YjhkMTc2ZmJlYmViMWE1YTkifX0sImlhdCI6MTQ5NTYyODAwMywiZXhwIjoxNDk1NjMxNjAzLCJpc3MiOiJTSzI2MzQ3MTM2N2E0OGI2Yjc4NjEyZTQyYzA5ZmFkNmI3Iiwic3ViIjoiQUM3OTMzOTk2M2E5OWY0NzZlNmYwYjMyMTRhYmQ0OGE5ZCJ9.m2dsJGkTyZ_b5aQnDVBBXTnukN29c3i7ADZh4BBNlpM' }
```

Event file is a YAML file, in this example:

```
username: "trump"
pincode: "928462"
```

### Run function with json

Similarly you could also run with json data directly:

```
$ twilio-runtime-utils -c context-local.yaml runjson Authenticator/descriptor.yaml '{"username": "trump", "pincode":"3245"}'
{ success: false,
  error: 'username or token provided is invalid' }
```

## Deploy Function

Currently there is no automated deployment supported due to the lack of API suppport from _Twilio Runtime_. But you could generate a deployment guideline with the following command anyway:

```
$ twilio-runtime-utils -c context-local.yaml deploy Authenticator/descriptor.yaml 
```

Follow the generated instructions on your terminal to deploy the _function_.

## Write Tests for Functions

_Utils_ provides `twilio-runtime-exec` and `TwilioRuntimeHelper` for you to write test cases for your _functions.

For example to write unit test in _mocha_:

- define test script in pakcage.json:
```
...
  "scripts": {
    "test": "twilio-runtime-exec ./node_modules/.bin/mocha --timeout 20000 specs.js"
  },
...
```

- Write mocha test cases:

```
const path = require("path");
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const TwilioRuntimeHelper = require("TwilioRuntimeHelper");

const contextFile = path.resolve(__dirname, "../../context-test.yaml");
const descriptorFile = path.resolve(__dirname, "../descriptor.yaml");

describe('Authenticator main test cases', function () {
    it('return valid jwt token on correct pincode', function (done) {
        TwilioRuntimeHelper.runTestDataJSON(contextFile, descriptorFile, {username: "trump", pincode: "928462"}, function (err, result) {
            expect(result.success).to.true;
            done();
        })
    });
...
});
```

