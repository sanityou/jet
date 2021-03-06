"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const routers = new Map();
exports.route = (...middlewares) => (target, url, method) => {
    const middleware = (target) => (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        function graphql(options) {
            const graphql = util_1.load(() => ({ name }) => require(name))('./graphql');
            return (graphql && graphql.default)(options);
        }
        const dispatch = util_1.applyMiddleware(target, ...middlewares)();
        const params = Object.assign({}, req.body, req.query);
        const result = yield dispatch({
            req,
            res,
            next,
            graphql,
            params
        });
        return result && res.json(result);
    });
    const value = middleware(target);
    url && method && routers.set(url, {
        value,
        method
    });
    return value;
};
exports.routeDecorator = (url, method = 'get', execute = 'execute') => (target, key, descriptor) => {
    const middleware = (target, key, descriptor) => (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const params = Object.assign({}, req.body, req.query);
        let result = {};
        if (typeof target === 'object') {
            result = yield (new target.constructor({ req, res, next }))[key](params);
        }
        else {
            result = yield new target({ req, res, next })[execute](params);
        }
        return result && res.json(result);
    });
    const value = middleware(target, key, descriptor);
    routers.set(url, {
        value,
        method
    });
    return value;
};
exports.use = (router) => {
    for (let key of routers.keys()) {
        const target = routers.get(key);
        router[target.method](key, (req, res, next) => {
            req.method = target.method;
            return target.value(req, res, next);
        });
    }
};
//# sourceMappingURL=route.js.map