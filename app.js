'use strict';

var App = angular.module('routingDemoApp', ['ui.router']);

App.service("authService", function () {
    return {
        authenticated: false
    };
}).service("authServiceManager", function () {
    return {
        self: this,
        currentAuthService: null,
        setCurrentAuthService: function (service) {
            self.currentAuthService = service;
        },
        getCurrentAuthService: function () {
            return self.currentAuthService;
        }
    };
}).run(function ($rootScope, authServiceManager, $state) {
    $rootScope.$on('$stateChangeError',
        function (event, toState, toParams, fromState, fromParams, error) {
            console.log("error");
        });

    $rootScope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams, options) {
            console.log("state change start: " + fromState.name + " -> " + toState.name);

            var authService = authServiceManager.getCurrentAuthService();
            if (authService && !authService.authenticated) {
                event.preventDefault();
                $state.go("business.abstract.authenticate", toParams, {notify: false}).then(function () {
                    $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                });
            }
        });

    $rootScope.$on('$stateChangeSuccess',
        function (event, toState, toParams, fromState, fromParams) {
            console.log("$stateChangeSuccess: " + fromState.name + " -> " + toState.name);
        });
}).config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    // For any unmatched url, send to /business
    $urlRouterProvider.otherwise("/business/abstract/products");

    $stateProvider
        .state('business', {
            url: "/business",
            templateUrl: "business.html",
            controller: function ($scope, authService) {
                $scope.isAuthenticated = function () {
                    return authService.authenticated;
                };
            },
        })
        .state("business.abstract", {
            abstract: true,
            url: "/abstract",
            templateUrl: "abstract.html",
            controller: function ($scope, authServiceManager, authService) {
                console.log("abstract-controller");
                authServiceManager.setCurrentAuthService(authService);
                $scope.products = ["Computer", "Printers", "Phones", "Bags"];
            },
        })
        .state('business.abstract.products', {
            url: "/products",
            views: {
                "": {
                    templateUrl: "products.html",
                    controller: function ($scope) {
                        console.log("products-controller");
                        $scope.products = ["Computer", "Printers", "Phones", "Bags"];
                    },
                }
            },
        })
        .state('business.abstract.services', {
            url: "/services",
            views: {
                "": {
                    templateUrl: "services.html",
                    controller: function ($scope) {
                        console.log("service-controller");
                        $scope.services = ["Selling", "Support", "Delivery", "Reparation"];
                    }
                }
            },
        })
        .state('business.abstract.authenticate', {
            url: "/authentication",
            views: {
                "@business": {
                    templateUrl: "authentication.html",
                    controller: function ($scope, authService) {
                        console.log("authenticate-controller");
                        $scope.authenticate = function () {
                            console.log("authenticate");
                            authService.authenticated = !authService.authenticated;
                        };
                        $scope.services = ["Selling", "Support", "Delivery", "Reparation"];
                    }
                }
            },
        })
        .state('portfolio', {
            url: "/portfolio",
            views: {
                "": {templateUrl: "portfolio.html"},
                "view1@portfolio": {template: "Write whatever you want, it's your virtual company."},
                "view2@portfolio": {
                    templateUrl: "clients.html",
                    controller: function ($scope) {
                        $scope.clients = ["HP", "IBM", "MicroSoft"];
                    }
                }
            }
        });
}]);
