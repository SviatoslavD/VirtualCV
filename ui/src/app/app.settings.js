(function() {
    'use strict';
    angular
        .module('VirtualCV.settings', [])
        .constant('globalGetStaticRoot', function(path) {

            if(!window.CONFIG) {
                throw 'Global CONFIG is not defined';
            }

            if(path) {
                if(path[0] === '/') {
                    console.log(path, path.substr(1));
                    path = path.substr(1);
                }
                return window.CONFIG.STATICDIR + path;
            }
            return window.CONFIG.STATICDIR;
        })
        // fetch global app config from gulp
        .provider('cvAppSettings', [function() {
            var appConfig = window.CONFIG;

            this.$get = function() {
                return {
                    getConfig: getConfig
                };
            };

            function getConfig() {
                return appConfig;
            }
        }]);
})();