var YAML = require('yamljs');

module.exports = {
    load: function (contextFile) {
        // load global context
        var context = YAML.load(contextFile);

        // conver all value to JSON string format
        for (let k in context) {
            if (typeof context[k] === "object") {
                context[k] = JSON.stringify(context[k]);
            }
        }

        if (!("ACCOUNT_SID" in context)) throw ("ACCOUNT_SID is not defined in the context");
        if (!("AUTH_TOKEN" in context)) throw ("AUTH_TOKEN is not defined in the context");

        return context;
    },

    deploy: function(context) {
        process.stdout.write("== switch on \"Enable ACCOUNT_SID and AUTH_TOKEN\"\n");
        process.stdout.write("== configure context variables according to this table\n");
        for (let k in context) {
            if (k === "ACCOUNT_SID") continue;
            if (k === "AUTH_TOKEN") continue;
            process.stdout.write(k + "\t: " + context[k] + "\n");
        }  
    }
}
