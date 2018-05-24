const defineClass = require("../defineClass");



const ApiContextBase = defineClass(function ApiContextBase(config) {
    
    this.__init__();

}).props({
    url: "",
    args: {
        value() {
            return {};
        },
        writable: true
    },
    callback() {
        return value => {};
    }

}).protoProps({
    testArgs(args) {
        for(var key in args) {
            this.args[key] = args[key].test(this.getArg(key));
        }
    },
    getArg: {
        value(name) {
            return null;
        },
        override: true
    },
    response(res) {
        this.callback(res);
    }

}).create();


module.exports = ApiContextBase;