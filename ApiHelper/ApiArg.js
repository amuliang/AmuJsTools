const defineClass = require("../defineClass");
const util = require("./lib/util");
const ApiException = require("./ApiException");


const ApiArgBase = defineClass(function ApiArgBase(config) {
    var parsed_config = this.parseConfig(config);
    this.applyConfig(parsed_config);
    this.__init__();

}).props({
    name: "",
    level: "", // must, free
    default: "",
    description: "",
    data_type: {
        value: "",
        override: true
    },
    examples() {
        return [];
    },
    options() {
        return null;
    },
    lack_status: 0,
    lack_message: "缺少参数",
    type_error_status: 0,
    type_error_message: "参数类型错误",
    invalid_status: 0,
    invalid_message: "格式无效的参数",
    invalidTest() {
        return value => true;
    }

}, { writable: false }).protoProps({
    parseConfig(config) {
        config = { config: config };
        var format_config = {
            config: { level: "must", type: Object, default: {}, children: {
                name: { level: "must", type: String, default: "" },
                level: { 
                    level: "free", 
                    type: String, 
                    default: "must", 
                    test: value => ["must", "free"].indexOf(value) != -1, 
                    test_error_message: "值只能为must或free" 
                },
                description: { level: "free", type: String, default: "" },
                default: { level: "free", type: null, default: undefined },
                examples: { level: "free", type: Array, default: [] },
                invalidTest: { level: "free", type: Function, default: (value, out) => { return true; } },
                options: { level: "free", type: Array, default: null },
            }}
        };
        return util.checkConfig(config, format_config).config;
    },
    applyConfig(config) {
        this.name = config.name;
        this.level = config.level;
        this.description = config.description;
        this.invalidTest = config.invalidTest;
        this.options = config.options == null ? null : config.options.map( elem => this.test(elem) );
        this.default = config.default == undefined ? this.default : this.test(config.default);
        this.examples = config.examples.map( elem => this.test(elem) );
    },
    test(value) {
        var error_prefix = "错误参数" + this.name + ":";
        // 首先检测是否为空值
        if (value == null || value == "undefined") {
            // 为空
            if (this.level == "must") {
                throw new ApiException(this.lack_status, error_prefix + this.lack_message);
            }else {
                return this.default;
            }
        }else {
            // 不为空
            // 检测是否为正确类型
            var out = { value: null, message: "" };
            if (this.typeTest(value, out)) {
                // 类型正确
                // 如果有选项，则从选项里面拿值
                if(this.options) {
                    if(this.options.indexOf(value) != -1) {
                        // 是选项中的值
                        return value;
                    }else {
                        // 不是选项中的值
                        var error_message = error_prefix + this.invalid_message + `\n详细错误信息：参数必须为[${this.options}]中的值\n参数值：${value}`;
                        throw new ApiException(this.invalid_status, error_message);
                    }
                }
                // 检测是否是合法有效的值
                if (this.invalidTest(out.value, out)) {
                    // 有效
                    return out.value;
                }else {
                    // 无效
                    var error_message = error_prefix + this.invalid_message + "\n详细错误信息：" + out.message + "\n参数值：" + value;
                    throw new ApiException(this.invalid_status, error_message);
                }
            }else {
                // 类型错误
                if (this.Level == "free") {
                    return this.default;
                }else {
                    var error_message = error_prefix + this.type_error_message + "\n详细错误信息：" + out.message + "\n参数值：" + value;
                    throw new ApiException(this.type_error_status, error_message);
                }
            }
        }
    },
    typeTest: {
        value(value, out) {
            out.value = value;
            return true;
        },
        override: true
    }

}).create();



const IntArg = defineClass(function IntArg(config) {
    this.__super__(config);
    this.__init__();

}).props({
    data_type: "int|整型",
    type_error_message: "参数必须为int类型"

}).protoProps({
    typeTest(value, out) {
        out.value = parseInt(value);
        return !isNaN(out.value);
    }

}).extend(ApiArgBase).create();



const StrArg = defineClass(function StrArg(config) {
    this.__super__(config);
    this.__init__();

}).props({
    data_type: "string|字符串",
    type_error_message: "参数必须为string类型"

}).protoProps({
    typeTest(value, out) {
        out.value = value;
        return true;
    }

}).extend(ApiArgBase).create();


module.exports = {
    ApiArgBase, StrArg, IntArg
}