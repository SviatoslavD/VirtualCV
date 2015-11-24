(function() {
    'use strict';
    angular
        .module('VirtualCV.dashboard', [])
        .controller('DashboardCtrl', DashboardCtrl);

        DashboardCtrl.$inject = ['$scope'];

        function DashboardCtrl($scope) {
            console.log('dashboard Ctrl');
        }
})();