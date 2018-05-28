const assert = require("assert");
const { ApiContainer, ApiUnit, ApiException, ApiContextBase } = require("../ApiHelper");
const defineClass = require("../../defineClass");



describe('节点', function() {
    describe('创建节点', function() {
        it('创建一个节点', function() {
            var unit = new ApiUnit({ name: "unit1" }, ctx => {
                ctx.response({});
            });
            assert.equal("unit1", unit.name);
        });
        it('创建一个节点，名字为空字符串应该报错', function() {
            var has_error = false;
            try {
                var unit = new ApiUnit({ name: "" }, ctx => {
                    ctx.response({});
                });
            }catch(e) {
                has_error = true;
            }
            assert.equal(true, has_error);
        });
    });
    describe('构造节点树', function() {
        it('根节点上添加两个子节点', function() {
            var unit = new ApiUnit({ name: "unit1" }, ctx => { ctx.response({}); });
            var unit2 = new ApiUnit({ name: "unit2" }, ctx => { ctx.response({}); });
            var unit3 = new ApiUnit({ name: "unit3" }, ctx => { ctx.response({}); });
            unit.register(unit2);
            unit.register(unit3);
            assert.equal("unit2", unit.children.unit2.name);
            assert.equal("unit3", unit.children.unit3.name);
        });
        it('三层节点树', function() {
            var unit = new ApiUnit({ name: "unit1" }, ctx => { ctx.response({}); });
            var unit2 = unit.register({ name: "unit2" }, ctx => { ctx.response({}); });
            var unit3 = unit2.register({ name: "unit3" }, ctx => { ctx.response({}); });
            assert.equal("unit2", unit.children.unit2.name);
            assert.equal("unit3", unit2.children.unit3.name);
        });
    });
    
});

describe('继承ApiContextBase类', function() {
    it('基本的继承', function() {
        var MyContext = defineClass(function MyContext() {
            this.__init__();
        }).props({
            request() {
                return null;
            }
        }).protoProps({
            getArg(name) {
                return this.request[name];
            }
        }).extend(ApiContextBase).create();
        assert.equal(true, new MyContext instanceof ApiContextBase);
    });
    it('不重写getArg报错', function() {
        var has_error = false;
        // try {
            var MyContext = defineClass(function MyContext() {
                this.__init__();
            }).props({
                request() {
                    return null;
                }
            }).protoProps({}).extend(ApiContextBase).create();
        // }catch(e) {
        //     has_error = true;
        // }
        assert.equal(true, has_error);
    });
});

describe('创建容器', function() {
    it('创建一个容器，注册根节点', function() {
        const MyContext = defineClass(function MyContext() {
            this.__init__();
        }).props({
            request() {
                return null;
            }
        }).protoProps({
            getArg(name) {
                return this.request[name];
            }
        }).extend(ApiContextBase).create();
        var container = new ApiContainer(MyContext);
        var root = new ApiUnit({ name: "api" }, ctx => { ctx.response({}); });
        container.register(root);
        assert.equal("api", container.root.name);
    });
});


describe('模拟请求', function() {
    describe('缺少请求参数', function() {
        
    });
    describe('请求参数类型', function() {
        
    });
    describe('请求参数有效性', function() {
        
    });
});