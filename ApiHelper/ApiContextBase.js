const defineClass = require("../defineClass");



const ApiContextBase = defineClass(function ApiContextBase() {
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
        return (value, error) => {};
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
    response(res, error) {
        this.callback(res, error);
    }

}).create();


module.exports = ApiContextBase;