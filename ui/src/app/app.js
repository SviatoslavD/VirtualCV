(function() {
    'use strict';
    angular
        .module('VirtualCV', [
            'ngAnimate',
            'ngAria',
            'ui.bootstrap',
            'ui.router',
            'LocalStorageModule',
            'ngResource',
            'ngRoute',
            
            //Services
            //'VirtualCV.api',
            'VirtualCV.settings',

            //Views
            'VirtualCV.dashboard'
            ])

        .run(runBlock);

        runBlock.$inject = ['$rootScope'];

        function runBlock($rootScope) {
            console.log('runBlock !!!');
        }
        // manually bootstrap application
        angular.element(document).ready(function() {
            angular.bootstrap(document, ['VirtualCV']);
        });
})();