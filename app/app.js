var sendshit = angular.module('sendsh.it', ['ngRoute', 'ngSanitize', 'ngProgressLite']);

sendshit.config(['$routeProvider', 'ngProgressLiteProvider', function($routeProvider, ngProgressLiteProvider) {

    if(!window.FileReader || !window.FormData || !window.Blob) {
        throw new Error('Your browser does not support required features.');
    }

    $routeProvider.when('/', {

        controller: 'UploadController',
        templateUrl: 'views/upload.html'

    }).when('/:downloadId/:downloadPassword', {

        controller: 'DownloadController',
        templateUrl: 'views/download.html'

    }).otherwise({

        redirectTo: '/'

    });

    ngProgressLiteProvider.settings.speed = 1;
    ngProgressLiteProvider.settings.minimum = 0.1;
    ngProgressLiteProvider.settings.ease = 'linear';

}]);

sendshit.factory('messages', ['$rootScope', function($rootScope){

    var message  = '';  
    var messages = {};

    messages.addMsg = function(msg, ellipsis) {

        ellipsis = typeof ellipsis !== 'undefined' ? ellipsis : false;

        if(ellipsis === true) {
            msg = msg + '<i class="ellipsis"><i>.</i><i>.</i><i>.</i></i>';
        }

        message = msg;

        $rootScope.$broadcast('message:updated', message);

    };

    messages.getMsg = function() {
        return message;
    }; 

    return messages;

}]);

sendshit.factory('triplesecProgress', ['$log', 'ngProgressLite', function($log, ngProgressLite) {

    var triplesecProgress = {};

    triplesecProgress.updateProgress = function(obj) {
        
        var percent = obj.i / obj.total;

        if(obj.what == 'pbkdf2 (pass 1)' || obj.what == 'pbkdf2 (pass 2)'){
            this.logProgress('Running PBKDF2', percent);
        }

        if(obj.what == 'scrypt'){
            this.logProgress('Scrypt', percent);
        }

        if(obj.what == 'salsa20'){
            this.logProgress('Salsa20', percent);
        }

        if(obj.what == 'twofish'){
            this.logProgress('Twofish-CTR', percent);
        }

        if(obj.what == 'aes'){
            this.logProgress('AES-256-CTR', percent);
        }

        if(obj.what == 'HMAC-SHA512-SHA3'){
            this.logProgress('Generating HMAC', percent);
        }

    };

    triplesecProgress.logProgress = function(text, percent)
    {
        $log.log(text + ': ' + Math.round(percent * 100) + '%');
        ngProgressLite.set(parseFloat(percent.toFixed(1)));
    };

    return triplesecProgress;

}]);