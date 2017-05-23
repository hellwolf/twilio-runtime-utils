var path = require("path");
var YAML = require('yamljs');
var FunctionDescriptor = require("./FunctionDescriptor.js");

module.exports = {
    load: function(descriptorFile) {
        let descriptor = YAML.load(descriptorFile);

        descriptor._resolvePath = function (f) {
            return path.resolve(path.dirname(descriptorFile), f);
        };

        if (descriptor.type === "function") {
            FunctionDescriptor.loadMore(descriptor);
        } else {
            throw("Unrecogonized descriptor type: " + descriptor.type);
        }
        return descriptor;
    }
}
