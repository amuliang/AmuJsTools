



/*
// 将配置文件批量处理，用法示例：
config = { config: config};
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
var formated_config = checkConfig(config, format_config);
*/
function checkConfig(config, format_config, formated_config) {
    formated_config = formated_config || {};
    for(var key in format_config) {
        var name = key;
        var value = config[name];
        var fc = format_config[name];
        if(typeof(value) == "undefined") {
            if(fc.level == "must") throw new Error(`配置属性${name}必须指定`);
            else value = fc.default;
        }else {
            if(fc.type == null) {}
            else if(fc.type == String && typeof(value) == "string") {}
            else if(fc.type == Number && typeof(value) == "number") {}
            else if(!(value instanceof fc.type)) {
                if(fc.level == "must") throw new Error(`配置属性${name}必须是${fc.type}类型`);
                else value = fc.default;
            }
        }
        if(fc.test && !fc.test(value)) {
            throw new Error(`配置属性${name}错误：${fc.test_error_message}`);
        }
        if(fc.children) {
            formated_config[name] = {};
            checkConfig(value, fc.children, formated_config[name]);
        }else {
            formated_config[name] = value;
        }
    }
    return formated_config;
}

module.exports = {
    checkConfig
}