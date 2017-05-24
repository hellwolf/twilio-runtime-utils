#!/usr/bin/env node
'use strict';

var fs = require('fs');
var ArgumentParser = require('argparse').ArgumentParser;
var Descriptor = require('./Descriptor.js');
var FunctionDescriptor = require('./FunctionDescriptor.js');
var Context = require('./Context.js');
var TwilioRuntimeHelper = require("./runtime/TwilioRuntimeHelper.js");

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
    description: 'run function locally with test data files'
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

var runCommandParser = subparsers.addParser('runjson', {
    addHelp: true,
    description: 'run function locally with test data json'
});
runCommandParser.addArgument(
    ['descriptor'],
    {
        help: 'function descriptor json'
    }
);
runCommandParser.addArgument(
    ['event'],
    {
        help: 'test event json'
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
// command: deploy
////////////////////////////////////////////////////////////
function deployFunction(functionDescriptor) {
    let spliter = "================================================================================\n";

    process.stdout.write(spliter);
    process.stdout.write("== create new function if needed\n");
    process.stdout.write("== set function path to: " + functionDescriptor.path + "\n");
    process.stdout.write("== switch off \"access control\"\n");
    process.stdout.write("== copy paste the script to function code area\n");

    process.stdout.write(spliter);
    let bundle = FunctionDescriptor.createBundle(functionDescriptor);
    process.stdout.write(bundle);

    process.stdout.write(spliter);
    var context = Context.load(args.context);
    Context.deploy(context);
}

////////////////////////////////////////////////////////////
// main
////////////////////////////////////////////////////////////
var args = parser.parseArgs();

function runResultHandler(err, result) {
    if (err) {
        console.error(err);
    } else {
        console.log(result);
    }
}

/*****/if ('run' === args.command_name) {
    TwilioRuntimeHelper.runTestDataFile(args.context, args.descriptor, args.event == null ? "" : args.event, runResultHandler);
} else if ('runjson' === args.command_name) {
    TwilioRuntimeHelper.runTestDataJSON(args.context, args.descriptor, JSON.parse(args.event), runResultHandler);
} else if ('deploy' === args.command_name) {
    var descriptor = Descriptor.load(args.descriptor);
    if (descriptor.type === "function") {
        deployFunction(descriptor);
    } else {
        console.error("descriptor is of unknown type: " + args.descriptor.type);
    }
}
