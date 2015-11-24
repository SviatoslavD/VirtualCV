// config file, only providers located here
(function() {
    'use strict';
    angular
        .module('VirtualCV')
        .config(config);

        config.$inject = ['$urlRouterProvider', '$stateProvider'];
        function config($urlRouterProvider, $stateProvider) {
            console.log('config providers !!!');
        }
})();