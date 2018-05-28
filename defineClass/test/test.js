const assert = require("assert");
const defineClass = require("../defineClass");


describe('创建类，创建对象', function() {
    describe('普通、原型、静态属性', function() {
        it('有普通属性的类', function() {
            var A = defineClass(function A() {
                this.__init__();
            }).props({
                test1: "test1",
            }).create();
            
            var a = new A();
            assert.equal("test1", a.test1);
        });

        it('普通属性可以用函数返回值', function() {
            var count = 5;
            var A = defineClass(function A() {
                this.__init__();
            }).props({
                test1() {
                    return ++count;
                },
            }).create();
            
            var a = new A();
            assert.equal(6, a.test1);
        });
        
        it('有原型属性的类', function() {
            var A = defineClass(function A() {
                this.__init__();
            }).protoProps({
                getTest1() {
                    return "test1"
                },
            }).create();
            
            var a = new A();
            assert.equal("test1", a.getTest1());
        });
        
        it('有静态属性的类', function() {
            var A = defineClass(function A() {
                this.__init__();
            }).staticProps({
                test1: "test1",
            }).create();
            
            assert.equal("test1", A.test1);
        });
    });

    describe('描述器属性', function() {
        it('writable(可写)配置', function() {
            var A = defineClass(function A() {
                this.__init__();
            }).props({
                test1: {
                    value: "test1",
                    writable: false
                }
            }).create();
            
            var a = new A();
            a.test1 = "test2";
            assert.equal("test1", a.test1);
        });
    });
});

describe('继承', function() {
    describe('普通属性、原型属性、静态属性继承', function() {
        it('继承普通属性test1', function() {
            var A = defineClass(function A() {
                this.__init__();
            }).props({
                test1: "test1",
            }).create();
            var B = defineClass(function B() {
                this.__init__();
            }).extend(A).create();
            
            var b = new B();
            assert.equal("test1", b.test1);
        });

        it('继承普通属性test1，并赋值', function() {
            var A = defineClass(function A() {
                this.__init__();
            }).props({
                test1: "test1",
            }).create();
            var B = defineClass(function B(value) {
                this.__init__();
                this.test1 = value;
            }).extend(A).create();
            
            var b = new B("test2");
            assert.equal("test2", b.test1);
        });

        it('继承原型属性test1', function() {
            var A = defineClass(function A() {
                this.__init__();
            }).protoProps({
                test1: "test1",
            }).create();
            var B = defineClass(function B() {
                this.__init__();
            }).extend(A).create();
            
            var b = new B();
            assert.equal("test1", b.test1);
        });

        it('继承静态属性test1', function() {
            var A = defineClass(function A() {
                this.__init__();
            }).staticProps({
                test1: "test1",
            }).create();
            var B = defineClass(function B() {
                this.__init__();
            }).extend(A, true).create();
            
            assert.equal("test1", B.test1);
        });

        it('不继承静态属性test1', function() {
            var A = defineClass(function A() {
                this.__init__();
            }).staticProps({
                test1: "test1",
            }).create();
            var B = defineClass(function B() {
                this.__init__();
            }).extend(A).create();
            
            assert.equal(true, typeof(B.test1) == "undefined");
        });
    });

    describe('inheritable配置', function() {
        it('A属性test1不可继承', function() {
            var A = defineClass(function A() {
                this.__init__();
            }).props({
                test1: {
                    value: "test1",
                    inheritable: false
                },
            }).create();
            var B = defineClass(function B() {
                this.__init__();
            }).extend(A).create();
            
            var b = new B();
            assert.equal(true, typeof(b.test1) == "undefined");
        });
    });

    describe('override配置', function() {
        it('不重写属性报错', function() {
            var has_error = false;
            var A = defineClass(function A() {
                this.__init__();
            }).props({
                request() {
                    return null;
                }
            }).protoProps({
                getArg: {
                    value(name) {
                        return this.request[name];
                    },
                    override: true
                }
            }).create();
            try {
                var B = defineClass(function B() {
                    this.__init__();
                }).protoProps({
                }).extend(A).create();
            }catch(e) {
                has_error = true;
            }
    
            assert.equal(true, has_error);
        });
    });
});

describe('1', function() {
    describe('1', function() {
    });
});