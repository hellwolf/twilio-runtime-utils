var YAML = require('yamljs');
var Descriptor = require('../Descriptor.js');
var Context = require('../Context.js');

function runtimeFunctionCallback(err, result) {
    if (err) {
        throw("Error: " + err);
    }
    process.stdout.write(JSON.stringify(result));
}

function runScript(descriptor, context, event) {
    for (let f in descriptor._includesCode) {
        let code = descriptor._includesCode[f];
        eval(code);
    };

    global.Twilio = require("twilio");        

    let functionModule = require(descriptor._scriptPath);
    functionModule.handler(context, event, runtimeFunctionCallback);
}

// Executor.js [files|json] descriptor_file context_file event_file
var mode = process.argv[2];
if (mode === "file") {
    let context = Context.load(process.argv[3]);
    var descriptor = Descriptor.load(process.argv[4]);
    if (descriptor.type !== "function") {
        throw("descriptor is of wrong type: " + descriptor.type);
    }
    let eventFile = process.argv[5];
    let event = eventFile ? YAML.load(eventFile) : {};
    runScript(descriptor, context, event);
} else if (mode === "json") {
    let context = Context.load(process.argv[3]);
    var descriptor = Descriptor.load(process.argv[4]);
    if (descriptor.type !== "function") {
        throw("descriptor is of wrong type: " + descriptor.type);
    }
    let eventJSON = process.argv[5];
    let event = eventJSON ? JSON.parse(eventJSON) : {};
    runScript(descriptor, context, event);
} else {
    throw("Unknown mode: " + mode);
}
