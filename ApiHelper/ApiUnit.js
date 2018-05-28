const defineClass = require("../defineClass");
const util = require("./lib/util");
const { StrArg, IntArg } = require("./ApiArg");


const ApiUnit = defineClass(function ApiUnit(config, body) {
    var parsed_config = this.parseConfig(config);
    // 将格式化后的config赋值给当前对象
    this.applyConfig(parsed_config);
    if(body) this.setBody(body);
    this.__init__();

}).props({
    name: "",
    description: "",
    args() {
        return {};
    },
    body() {
        return null;
    },
    return() {
        return {
            type: Object,
            description: "",
            examples: []
        };
    },
    children() {
        return {};
    }

}, { writable: false }).protoProps({
    parseConfig(config) {
        config = { config: config };
        var format_config = {
            config: { level: "must", type: Object, default: {}, children: {
                name: { level: "must", type: String, default: "", test: value => value != "", test_error_message: "值不能为空字符串" },
                description: { level: "free", type: String, default: "" },
                args: { level: "free", type: Object, default: {} },
                return: { level: "free", type: Object, default: {}, children: {
                    type: { level: "free", type: Function, default: Object },
                    description: { level: "free", type: String, default: "" },
                    examples: { level: "free", type: Array, default: [] },
                }},
            }}
        };
        // 格式化config
        config = util.checkConfig(config, format_config).config;
        // 简单处理请求参数，更详细处理在创建请求参数对象的时候做
        var arg_types = ["string", "int"];
        for(var key in config.args) {
            var arg = config.args[key];
            if(!(arg instanceof Object)) throw new Error(`接口请求参数${key}配置必须为对象`);
            if(typeof(arg.type) != "string" || arg_types.indexOf(arg.type) == -1) throw new Error(`接口请求参数type必须指定且必须为[${arg_types.join(",")}]中的值，当前值为${arg.type}`);
            arg.name = key;
        }
        return config;
    },
    applyConfig(config) {
        this.name = config.name;
        this.description = config.description;
        this.return = config.return;
        var args = {};
        for(var key in config.args) {
            var arg = config.args[key];
            switch(arg.type) {
                case "string": args[key] = new StrArg(arg); break;
                case "int": args[key] = new IntArg(arg); break;
            }
        }
        this.args = args;
    },
    setBody(body) {
        if(typeof(body) == "undefined") {
            throw new Error(`接口属性body必须指定`);
        }else if(!(body instanceof Function)) {
            throw new Error(`接口属性body必须是Function类型`);
        }
        this.body = body;
    },
    register(api_unit, body) {
        if(!(api_unit instanceof ApiUnit)) {
            api_unit = new ApiUnit(api_unit, body);
        }
        if(this.children[api_unit.name]) {
            throw new Error(`不能在节点${this.name}下重复注册名为${api_unit.name}的节点`);
        }
        this.children[api_unit.name] = api_unit;
        return api_unit;
    },
    getApiJson() {
        var root = {};
        root.name = this.name;
        root.description = this.description;
        root.args = {};
        for(var key in this.args) {
            var arg_json = {};
            var arg = this.args[key];
            arg_json.name = arg.name;
            arg_json.type = arg.data_type;
            arg_json.description = arg.description;
            arg_json.default = arg.default;
            arg_json.level = arg.level;
            arg_json.example = arg.examples[0] || null;
            arg_json.examples = arg.examples;
            root.args[key] = arg_json;
        }
        root.children = {};
        for(var key in this.children) {
            root.children[key] = this.children[key].getApiJson();
        }
        root.return_description = this.return.description;
        root.return_example = this.return.examples[0] || null;
        root.return_examples = this.return.examples;
        return root;
    }

}).create();

module.exports = ApiUnit;