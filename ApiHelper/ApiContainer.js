const defineClass = require("../defineClass");
const ApiUnit = require("./ApiUnit");
const ApiContextBase = require("./ApiContextBase");
const ApiException = require("./ApiException");



const ApiContainer = defineClass(function ApiContainer(context_type) {
    if(!(new context_type instanceof ApiContextBase)) throw new Error(`context_type必须继承${ApiContextBase}`);
    this.context_type = context_type;
    this.__init__();

}).props({
    root() {
        return null;
    },
    context_type: {
        value() {
            return null;
        },
        writable: false
    }
}).protoProps({
    register(api_unit, body) {
        if(!(api_unit instanceof ApiUnit)) {
            api_unit = new ApiUnit(api_unit, body);
        }
        this.root = api_unit;
        return this.root;
    },
    request(ctx, callback) {
        if(!(ctx instanceof ApiContextBase)) throw new Error(`ctx必须继承${ApiContextBase}`);
        if(typeof(ctx.url) != "string" || ctx.url == "") throw new Error(`url必须为字符串，且不为空`);
        if(this.root == null) throw new Error(`还未注册接口根节点`);

        var actions = ctx.url.split("/");
        var node = this.root;
        if(actions[0] != this.root.name) {
            node = null;
        }else {
            for(var i = 1; i < actions.length; i++) {
                var action = actions[i];
                if(node.children[action]) {
                    node = node.children[action];
                }else {
                    node = null;
                    break;
                }
            }
        }

        if(callback instanceof Function) {
            ctx.callback = callback;
        }
        var result = null;
        try {
            if(node == null) {
                throw new ApiException(0, `未找到接口${ctx.url}`);
            }else {
                if(!(node.body instanceof Function)) {
                    throw new ApiException(0, `接口${ctx.url}没有函数体`);
                }
                ctx.testArgs(node.args);
                result = node.body(ctx);
            }
        }catch(e) {
            if(e instanceof ApiException) {
                result = e;
                ctx.callback(null, e);
            }else {
                throw new Error(e.message);
            }
        }
        return result;
    }
}).create();

module.exports = ApiContainer;