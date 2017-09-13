var child_process = require('child_process');
var path = require("path");

function parseChildResult(child, done) {
    let resolver = (resolve, reject) => {
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
                if (err) console.log(err);
                resolve(JSON.parse(data));
            } else {
                console.error(err);
                reject("Child exited with code: " + code + (signal?" and signal: " + signal:""));
            }
        });
    }

    if (!done) {
        promise = new Promise(resolver);
        done = (err, done) => { if (err) p.reject(err); else p.resolve(done) };
        return promise;
    } else {
        resolver((result) => done(null, result), (err) => done(err));
    }
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
