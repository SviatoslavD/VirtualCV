(function() {
    'use strict';
    angular
        .module('VirtualCV')
        .config(routes);

        routes.$inject = ['$urlRouterProvider', '$stateProvider', 'globalGetStaticRoot'];

        function routes($urlRouterProvider, $stateProvider, globalGetStaticRoot) {
            console.log('!!!routes !!!');

            $stateProvider
                .state('dashboard', {
                    url: '/dashboard',
                    controller: 'DashboardCtrl',
                    templateUrl: globalGetStaticRoot('app/views/dashboard/dashboard.html')
                });
        }

})();