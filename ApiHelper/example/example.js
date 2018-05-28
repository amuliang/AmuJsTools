const { ApiContainer, ApiUnit, ApiContextBase, ApiException } = require("../ApiHelper");
const defineClass = require("../../defineClass");


// 返回值类型
function ObjectResult(data) {
    this.status = 10010;
    this.data = null;
    Object.assign(this, data);
}


// 接口参数类
const MyContext = defineClass(function MyContext() {
    this.__init__();
    this.__super__();

}).props({
    request() {
        return {};
    },
    session() {
        return {};
    },
    cookies() {
        return {};
    }

}).protoProps({
    // getArg(name) {
    //     return this.request[name];
    // }

}).extend(ApiContextBase).create();


// 创建接口树
const root = new ApiUnit({ name: "api" });
// 创建子接口
const user = root.register({name: "user"});


/**********************************************************/
user.register({
    name: "update",
    args: {
        id: { type: "int", level: "must" },
        name: { type: "string", level: "free" },
        sex: { type: "string", level: "free", default: "男", options: ["男", "女"]}
    }
}, ctx => {
    ctx.response({
        id: ctx.args.id,
        name: ctx.args.name,
        sex: ctx.args.sex
    });
});

/**********************************************************/
user.register({
    name: "delete",
    args: {
        id: { type: "int", level: "must" }
    }
}, ctx => {
    setTimeout(() => {
        ctx.response("delete"+ctx.args.id);
    }, Math.random()*5000);
});

/******************************************************************************************************************/


// 创建接口容器，并将接口树根节点注册到容器上
const container = new ApiContainer(MyContext);
container.register(root);


// 模拟请求

var result = null;
try {
    var count = 0;
    for(var i = 0; i < 10000; i++) {
        var ctx = new MyContext();
        ctx.url = "api/user/delete";
        ctx.request.id = i;
        container.request(ctx, res => {
            console.log(ctx.url, res, ++count);
        });
    }
}catch(e) {
    if(e instanceof ApiException) {
        var result = new ObjectResult({ status: e.status, data: e.message });
        console.log(result);
    }
    else throw new Error(e.message);
}