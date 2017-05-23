var child_process = require('child_process');
var path = require("path");

function parseChildResult(child, done) {
    var err = "";
    var data = "";
    child.stdout.on('data', function (d) {
        data += d;
    });
    child.stderr.on('data', function (d) {
        err += d;
    });
    child.on('exit', function(code, signal) {
        if (code === 0) {
            done(null, JSON.parse(data));
        } else {
            console.error(err);
            done("Child exited with code: " + code + (signal?" and signal: " + signal:""));
        }
    });
}

module.exports = {
    runTestDataFile: function(contextFile, descriptorFile, eventFile, done) {
        let child = child_process.fork(path.resolve(__dirname, "TwilioRuntimeExecutor.js"), ['file', contextFile, descriptorFile, eventFile], {silent: true});
        return parseChildResult(child, done);
    },

    runTestDataJSON: function(contextFile, descriptorFile, eventJSON, done) {
        let child = child_process.fork(path.resolve(__dirname, "TwilioRuntimeExecutor.js"), ['json', contextFile, descriptorFile, JSON.stringify(eventJSON)], {silent: true});
        return parseChildResult(child, done);
    }
};
