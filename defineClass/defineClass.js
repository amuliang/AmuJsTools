//; var defineClass = (function () {
    // 判断IE版本，IE8及其以下版本是不支持defineProperty的
    if (typeof(document) != "undefined" && new RegExp("MSIE (\\d+\\.\\d+);").test(navigator.userAgent) && parseFloat(RegExp["$1"]) < 9) {
        throw new Error("The version less than IE9 is not supported");
    }

    var _constructor, _props, _protoProps, _staticProps, _extends;
    var _props_config, _protoProps_config, _staticProps_config;
    var _inhertSuperClassStatic;

    function defineClass(constructor) {
        _constructor = _props = _protoProps = _staticProps = _extends = null;
        _props_config = _protoProps_config = _staticProps_config = null;
        _inhertSuperClassStatic = false;
        _constructor = constructor;
        return _defineClass;
    }

    var _defineClass = {};
    _addProps(_defineClass, {
        props: function (props, config) {
            _props = props;
            _props_config = config;
            return _defineClass;
        },
        protoProps: function (protoProps, config) {
            _protoProps = protoProps;
            _protoProps_config = config;
            return _defineClass;
        },
        staticProps: function (staticProps, config) {
            _staticProps = staticProps;
            _staticProps_config = config;
            return _defineClass;
        },
        extend: function (extend, inhertParent) {
            _extends = extend;
            _inhertSuperClassStatic = inhertParent || _inhertSuperClassStatic;
            return _defineClass;
        },
        create: function () { return _createClass(_constructor, _props, _props_config, _protoProps, _protoProps_config, _staticProps, _staticProps_config, _extends, _inhertSuperClassStatic) }
    }, {
        enumerable: false,
        configurable: false,
        writable: false
    });

    function _createClass(subClass, props, props_config, protoProps, protoProps_config, staticProps, staticProps_config, superClass, inhertSuperClassStatic) {
        if (!subClass) {
            throw new ReferenceError("constructor must be a function");
        } else {
            if (typeof subClass != "function") {
                throw new ReferenceError("constructor must be a function");
            } else if (subClass.name == "") {
                throw new ReferenceError("constructor must have a name");
            }
        }

        var hasSuperClass = false;
        if (superClass && typeof superClass == "function") {
            hasSuperClass = true;
            // 继承
            /*     
                这里相当于
                    subClass.prototype = {
                        __proto__: superClass.prototype,
                        constructor: subClass
                    };
                但是IE10-都不支持__proto__
            */
            subClass.prototype = Object.create(superClass.prototype);
            subClass.prototype.constructor = subClass;
        }

        protoProps = protoProps || {};
        // 核心函数，它的作用为执行父级构造函数
        protoProps.__super__ = {
            value: function () {
                if(hasSuperClass) superClass.apply(this, arguments);
            },
            writable: false,
            enumerable: false,
            configurable: false
        }
        // 核心函数，它的作用为继承变量
        protoProps.__init__ = {
            value: function (notSelf) {
                // 如果已经初始化过就不再执行初始化了
                if(this.__is_inited__ && this.__is_inited__[subClass.name]) return;
                // 添加自身属性，放在前面使得父级发现子集有该属性就跳过
                _addProps(this, props, props_config, notSelf, true);
                //
                if (hasSuperClass) {
                    // 找到父级的初始化函数
                    var super__init__ = superClass.prototype.__init__;
                    if (super__init__ && typeof super__init__ == "function") super__init__.call(this, true);
                }
                // 初始化后判断当前对象是否有__is_inited__属性了，如果没有加上，这个属性只是为了做标记用的
                if(!this.__is_inited__) {
                    _addProps(this, {
                        __is_inited__: {
                            value: {},
                            enumerable: false,
                            configurable: false
                        }
                    }, {}, notSelf);
                }
                this.__is_inited__[subClass.name] = true;
            },
            writable: false,
            enumerable: false,
            configurable: false
        }
        // 核心函数，它的作用为继承静态属性，当extend(subClass, true)时，会继承父级的静态属性
        protoProps.__init_static__ = {
            value: function (notSelf) {
                // 添加自身属性，放在前面使得父级发现子集有该属性就跳过
                _addProps(this, staticProps, staticProps_config, notSelf);
                // 判断是否继承父级的静态属性
                if (inhertSuperClassStatic && hasSuperClass) {
                    // 找到父级的静态变量初始化函数
                    var super__init_static__ = superClass.prototype.__init_static__;
                    if (super__init_static__ && typeof super__init_static__ == "function") super__init_static__.call(this, true);
                }
            },
            writable: false,
            enumerable: false,
            configurable: false
        }
        // 添加原型属性，涉及不到继承，因为原型链本身就有继承
        _addProps(subClass.prototype, protoProps, protoProps_config);
        // 添加静态属性
        subClass.prototype.__init_static__.call(subClass);

        return subClass;
    }

    // notSelf是判断属性继承的辅助变量
    function _addProps(target, props, config, notSelf, notObj) {
        if (!props) return;

        config = config || {
            enumerable: true, // 优先设为可枚举
            configurable: true, // 优先设为可配置，可删除，这是比较常规方式
            writable: true, // 优先设为可写，毕竟只读属性很少
            override: false // 优先设为不可重写
        }

        for (var key in props) {
            var descriptor = props[key];
            var parsed_descriptor = {};
            if (descriptor != null && typeof descriptor == "object") { // 如果描述器是一个对象，则视为描述器
                parsed_descriptor.enumerable = typeof descriptor.enumerable != "undefined" ? descriptor.enumerable : config.enumerable;
                parsed_descriptor.configurable = typeof descriptor.configurable != "undefined" ? descriptor.configurable : config.configurable;
                // 描述器至少应该包含value或者get中的一个，否则视为无效的描述器，抛出错误
                if ("value" in descriptor) {
                    parsed_descriptor.value = descriptor.value;
                    parsed_descriptor.writable = typeof descriptor.writable != "undefined" ? descriptor.writable : config.writable;
                }else if("get" in descriptor) {
                    parsed_descriptor.get = descriptor.get;
                    if("set" in descriptor) parsed_descriptor.set = descriptor.set;
                }else {
                    throw new Error(`属性${key}错误：属性描述其必须包含value或get属性`);
                }
                parsed_descriptor.override = typeof descriptor.override != "undefined" ? descriptor.override : config.override;
            } else { // 如果描述器不是个对象，则视为属性值
                parsed_descriptor = {
                    value: descriptor,
                    enumerable: config.enumerable,
                    configurable: config.configurable,
                    writable: config.writable,
                    override: config.override
                }
            }
            // 判断是否属性值不能为对象
            if(notObj) {
                // 如果值为对象，则抛出错误
                if(typeof(parsed_descriptor.value) == "object") {
                    throw new Error(`属性${key}值value为[对象,数组,函数]，必须以函数形式返回这个值`);
                }
                // 如果值为函数，则执行这个函数，将返回值视为属性值
                if(parsed_descriptor.value instanceof Function) parsed_descriptor.value = parsed_descriptor.value();
            }
            // 判断属性是否可继承，不可继承便跳过
            if (notSelf && typeof parsed_descriptor.inheritable != "undefined" && parsed_descriptor.inheritable == false) {
                continue;
            }
            // 如果子集已经有了该属性，则跳过
            if(notSelf && target.hasOwnProperty(key) && target[key] != undefined) { 
                continue;
            }
            // 如果属性需要被重写
            if(notSelf && parsed_descriptor.override == true && !target.hasOwnProperty(key)) { 
                throw new Error(`${target.__proto__.constructor.name}必须重写继承属性${key}`);
            }
            // 如果已经有同名属性，则将value改为目前的值
            if(target.hasOwnProperty(key) && target[key] != undefined && parsed_descriptor.value != undefined) { 
                parsed_descriptor.value = target[key];
            }
            // 定义属性
            Object.defineProperty(target, key, parsed_descriptor);
        }
    }

//    return defineClass;
//})();

module.exports = defineClass;