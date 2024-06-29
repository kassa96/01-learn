export class Router {
    private routes: { [route: string]: () => void };
    private currentRoute: string;
  
    constructor() {
      this.routes = {};
      this.currentRoute = '/';
    }
  
    public addRoute(route: string, callback: () => void): void {
      this.routes[route] = callback;
    }
  
    public navigate(route: string): void {
      if (this.routes[route]) {
        this.currentRoute = route;
        this.routes[route]();
      } else {
        this.navigate('/');
      }
    }
  }
  