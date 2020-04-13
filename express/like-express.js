const http = require('http')
const slice = Array.prototype.slice

class LikeExpress {
    // 存放中间件的列表
    constructor() {
        this.router = {
            all: [],
            get: [],
            post: []
        }
    }

    register(path) {
        // 当前的注册信息
        const info = {}
        if (typeof path === 'string') {
            info.path = path
            // 从第二个参数开始，转换为数组，存入 stack
            info.stack = slice.call(arguments, 1)
        } else {
            info.path = '/'
            info.stack = slice.call(arguments, 0)
        }
        return info
    }

    use() {
        const info = this.register.apply(this, arguments)
        this.router.all.push(info)
    }

    get() {
        const info = this.register.apply(this, arguments)
        this.router.get.push(info)
    }

    post() {
        const info = this.register.apply(this, arguments)
        this.router.post.push(info)
    }

    // 匹配中间件的列表
    match(method, url) {
        let stack = []
        if ( url === '/favicon.ico') {
            return stack
        }

        // 获取 routes
        let curRoutes = []
        curRoutes = curRoutes.concat(this.router.all)
        curRoutes = curRoutes.concat(this.router[method])

        curRoutes.forEach(routerInfo => {
            if(url.indexOf(routerInfo.url) === 0)
                // url === '/api/get-cookie' 且 routerInfo.path === '/
                // url === '/api/get-cookie' 且 routerInfo.path === '/api
                // url === '/api/get-cookie' 且 routerInfo.path === '/api/get-cookie
                stack = stack.concat(routerInfo.stack)
        })
        return stack
    }

    // 核心的next 机制
    handel(req, res, stack) {
        const next = () => {
            const middleware = stack.shift()
            if (middleware) {
                // 执行中间件函数
                middleware(req, res, next)  
            }
        }
        next()
    }

    callBack() {
        return (req, res) => {
            res.json = (data) => {
                res.setHeader('Content-type','application/json')
                res.end(
                    JSON.stringify()
                )
            }
            const url = req.url
            const method = req.method.toLowerCase()
            // 用到的中间件
            const resultList = this.match(method, url)
            this.handle(req, res, resultList)
        }
    }

    listen(...args) {
        const server = http.createServer(this.callBack())
        server.listen(...args)
    }
}

// 工厂函数
module.exports = () => {
    return new LikeExpress()
}