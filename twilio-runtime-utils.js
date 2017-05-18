#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require("path");
var ArgumentParser = require('argparse').ArgumentParser;
var YAML = require('yamljs');

const runtimePath = path.resolve(__dirname, 'runtime', 'node_modules');

function extend(obj, src) {
    Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
    return obj;
}

////////////////////////////////////////////////////////////
// argument parser
////////////////////////////////////////////////////////////
var parser = new ArgumentParser({
    addHelp: true,
    description: 'Twilio Runtime Utilities'
});

parser.addArgument(
    ['-c', '--context'],
    {
        help: 'global context for data that are deployment specific',
        required: true
    }
);

var subparsers = parser.addSubparsers({
  title: 'commands',
  dest: 'command_name'
});

var runCommandParser = subparsers.addParser('run', {
    addHelp: true,
    description: 'run function locally with test data'
});
runCommandParser.addArgument(
    ['descriptor'],
    {
        help: 'function descriptor yaml'
    }
);
runCommandParser.addArgument(
    ['event'],
    {
        help: 'test event yaml'
    }
);

var deployCommandParser = subparsers.addParser('deploy', {
    addHelp: true,
    description: 'deploy single function or whole runtime functions set to the runtime deployment'
});
deployCommandParser.addArgument(
    ['descriptor'],
    {
        help: 'function or runtime descriptor yaml'
    }
);

////////////////////////////////////////////////////////////
// common
////////////////////////////////////////////////////////////
function loadFunctionDescriptor(descriptorFile, descriptor) {
    descriptor.resolvePath = function (f) {
        return path.resolve(path.dirname(descriptorFile), f);
    };
    descriptor.scriptPath = descriptor.resolvePath(descriptor.script);
    if (descriptor.includes) {
        descriptor.includesCode = {};
        descriptor.includes.forEach(function (f) {
            let includeFile = descriptor.resolvePath(f);
            let code = fs.readFileSync(includeFile, 'utf8');
            descriptor.includesCode[f] =code;
        });
    }
    return descriptor;
}

////////////////////////////////////////////////////////////
// command: run
////////////////////////////////////////////////////////////
function runtimeFunctionCallback(err, result) {
    if (err) {
        console.error("Error: " + err);
        return;
    }
    console.log(result);
}

function runRuntimeFunction(globalContext, functionDescriptor, eventFile) {
    global.Twilio = require("twilio");

    let event = 'null' === args.event ? null : YAML.load(eventFile);

    for (let f in functionDescriptor.includesCode) {
        let code = functionDescriptor.includesCode[f];
        eval(code);
    };
    let functionModule = module.require(functionDescriptor.scriptPath);
    functionModule.handler(globalContext, event, runtimeFunctionCallback);
}

////////////////////////////////////////////////////////////
// command: deploy
////////////////////////////////////////////////////////////
function createFunctionBundle(functionDescriptor) {
    let spliter = "================================================================================\n";
    process.stdout.write(spliter);
    process.stdout.write("== create new function if needed\n");
    process.stdout.write("== set function path to: " + functionDescriptor.path + "\n");
    process.stdout.write("== switch off \"access control\"\n");
    process.stdout.write("== copy paste the script to function code area\n");
    process.stdout.write(spliter);
    let bundle = "";
    for (let f in functionDescriptor.includesCode) {
        let code = functionDescriptor.includesCode[f];
        bundle += "// Include: " + f + "\n";
        bundle += code;
        bundle += "\n";
    };
    bundle += "// Main script: " + functionDescriptor.script + "\n";
    bundle += fs.readFileSync(functionDescriptor.scriptPath);
    process.stdout.write(bundle);

    process.stdout.write(spliter);
    process.stdout.write("== switch on \"Enable ACCOUNT_SID and AUTH_TOKEN\"\n");
    process.stdout.write("== configure context variables according to this table\n");
    for (let k in globalContext) {
        if (k === "ACCOUNT_SID") continue;
        if (k === "AUTH_TOKEN") continue;
        process.stdout.write(k + "\t: " + globalContext[k] + "\n");
    }
}

////////////////////////////////////////////////////////////
// main
////////////////////////////////////////////////////////////
var args = parser.parseArgs();

// load global context
var globalContext = YAML.load(args.context);
// conver all value to JSON string format
for (let k in globalContext) {
    if (typeof globalContext[k] === "object") {
        globalContext[k] = JSON.stringify(globalContext[k]);
    }
}

/*****/if ('run' === args.command_name) {
    let descriptorFile = args.descriptor;
    let descriptor = YAML.load(descriptorFile);
    if (descriptor.type !== "function") {
        return console.error("descriptor is of wrong type: " + functionDescriptor.type);
    }
    let functionDescriptor = loadFunctionDescriptor(descriptorFile, descriptor);
    runRuntimeFunction(globalContext, functionDescriptor, args.event);
} else if ('deploy' === args.command_name) {
    let descriptorFile = args.descriptor;
    let descriptor = YAML.load(descriptorFile);
    if (descriptor.type === "function") {
        let functionDescriptor = loadFunctionDescriptor(descriptorFile, descriptor);
        createFunctionBundle(functionDescriptor);
    } else {
        console.error("descriptor is of unknown type: " + args.descriptor.type);
    }
}
