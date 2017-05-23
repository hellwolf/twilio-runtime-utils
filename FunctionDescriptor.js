var fs = require('fs');

module.exports = {
    loadMore: function(descriptor) {
        descriptor._scriptPath = descriptor._resolvePath(descriptor.script);

        if (descriptor.includes) {
            descriptor._includesCode = {};
            descriptor.includes.forEach(function (f) {
                let includeFile = descriptor._resolvePath(f);
                let code = fs.readFileSync(includeFile, 'utf8');
                descriptor._includesCode[f] =code;
            });
        }
    },

    createBundle: function(functionDescriptor) {
        let bundle = "";
        for (let f in functionDescriptor.includesCode) {
            let code = functionDescriptor.includesCode[f];
            bundle += "// Include: " + f + "\n";
            bundle += code;
            bundle += "\n";
        };
        bundle += "// Main script: " + functionDescriptor.script + "\n";
        bundle += fs.readFileSync(functionDescriptor._scriptPath);
        return bundle;
    }
};
