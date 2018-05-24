const defineClass = require("../defineClass");


const ApiException = defineClass(function ApiException(status, message) {
    this.status = status;
    this.message = message;
    this.__init__();

}).props({
    status: 10010,
    message: ""
}, { writable: false }).create();


module.exports = ApiException;