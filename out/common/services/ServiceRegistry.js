"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDecorator = exports.getServiceDependencies = exports.serviceRegistry = void 0;
const DI_TARGET = 'di$target';
const DI_DEPENDENCIES = 'di$dependencies';
exports.serviceRegistry = new Map();
function getServiceDependencies(ctor) {
    return ctor[DI_DEPENDENCIES] || [];
}
exports.getServiceDependencies = getServiceDependencies;
function createDecorator(id) {
    if (exports.serviceRegistry.has(id)) {
        return exports.serviceRegistry.get(id);
    }
    const decorator = function (target, key, index) {
        if (arguments.length !== 3) {
            throw new Error('@IServiceName-decorator can only be used to decorate a parameter');
        }
        storeServiceDependency(decorator, target, index);
    };
    decorator.toString = () => id;
    exports.serviceRegistry.set(id, decorator);
    return decorator;
}
exports.createDecorator = createDecorator;
function storeServiceDependency(id, target, index) {
    if (target[DI_TARGET] === target) {
        target[DI_DEPENDENCIES].push({ id, index });
    }
    else {
        target[DI_DEPENDENCIES] = [{ id, index }];
        target[DI_TARGET] = target;
    }
}
//# sourceMappingURL=ServiceRegistry.js.map