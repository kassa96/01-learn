var Router = /** @class */ (function () {
    function Router() {
        this.routes = {};
        this.currentRoute = '/';
    }
    Router.prototype.addRoute = function (route, callback) {
        this.routes[route] = callback;
    };
    Router.prototype.navigate = function (route) {
        if (this.routes[route]) {
            this.currentRoute = route;
            this.routes[route]();
        }
        else {
            this.navigate('/');
        }
    };
    return Router;
}());
export { Router };
