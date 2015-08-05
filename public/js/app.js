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
sendshit.controller('DownloadController', ['$scope', '$routeParams', 'decryptor', 'fileReader', 'messages', function($scope, $routeParams, decryptor, fileReader, messages) {

    var password = $routeParams.downloadPassword;

    decryptor.downloadFile('download?id=' + $routeParams.downloadId).then(function(data) {

        var blob = new Blob([data], {type: 'application/octet-stream'});

        return fileReader.readAsText(blob);

    }).then(function(file) {

        return decryptor.decryptFile(file, password);

    }).then(function(decrypted) {

        messages.addMsg('Done');
        saveAs(decrypted.blob, decrypted.name);

    }, function(error) {

        messages.addMsg(error);

    });

    $scope.$on('message:updated', function(event, message) {
        $scope.message = message;
    });

}]);
sendshit.controller('UploadController', ['$scope', '$q', 'encryptor', 'fileReader', 'messages', function($scope, $q, encryptor, fileReader, messages) {

    $scope.fileUploaded = false;

    $scope.uploadFile = function(event) {

        var file = $scope.uploadedFile;

        if(file.size > 5000000) {
            messages.addMsg('File must be under 5MB');
            return false;
        }

        $scope.uploadFieldText = file.name;

        $q.all([fileReader.readAsDataUrl(file), encryptor.generateKey()]).then(function(data){

            return encryptor.encryptFile(data[0].name, data[0].reader, data[1]);

        }).then(function(encrypted) {

            return encryptor.uploadFile(encrypted);

        }).then(function(link) {

            $scope.fileUploaded = true;
            $scope.uploadLink = link;

        }, function(error) {

            messages.addMsg(error);

        });

    };

    $scope.$on('message:updated', function(event, message) {
        $scope.message = message;
    });

}]);
sendshit.directive('selectOnClick', function () {
    return {
        restrict: 'A',
        link: function (scope, element) {
            var focusedElement;
            element.on('click', function () {
                if (focusedElement != this) {
                    this.select();
                    focusedElement = this;
                }
            });
            element.on('blur', function () {
                focusedElement = null;
            });
        }
    };
});
sendshit.directive('uploadOnChange', function() {
    return {
        require:"ngModel",
        restrict: 'A',
        link: function($scope, el, attrs, ngModel){
            el.bind('change', function(event){
                ngModel.$setViewValue(event.target.files[0]);
                $scope.$apply();
            });
        }
    };
});
sendshit.service('decryptor', ['$http', '$q', 'messages', 'triplesecProgress', function ($http, $q, messages, triplesecProgress) {

    var downloadFile = function(url) {

        var deferred = $q.defer();

        messages.addMsg('Downloading', true);    

        var httpPromise = $http.get(url).then(function(response) {

            if(response.data.error){

                deferred.reject(response.data.error);

            } else {

                messages.addMsg('Downloaded');
                deferred.resolve(response.data);

            } 

        }, function(error) {

            deferred.reject(error.data);

        });

        return deferred.promise;

    };

    var decryptFile = function(file, password) {

        var deferred = $q.defer();

        messages.addMsg('Decrypting', true);

        triplesec.decrypt ({  

            data: new triplesec.Buffer(file, 'hex'),
            key:  new triplesec.Buffer(password),

            progress_hook: function (obj) {
                triplesecProgress.updateProgress(obj);
            }

        }, function (err, buff) { 

            if (err) {
                return deferred.reject(err.message);
            }

            messages.addMsg('Decrypted');

            var decrypted  = JSON.parse(buff.toString());
            var mimeString = decrypted.file.split(',')[0].split(':')[1].split(';')[0];
            var blob       = b64toBlob(decrypted.file.split(',')[1], mimeString);

            deferred.resolve({
                blob: blob,
                name: decrypted.name
            });

        });

        return deferred.promise;

    };

    // http://stackoverflow.com/a/16245768
    var b64toBlob = function (b64Data, contentType, sliceSize) {

        contentType = contentType || '';
        sliceSize   = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {

            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);

            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);

        }

        var blob = new Blob(byteArrays, {type: contentType});

        return blob;
        
    };

    return {
        downloadFile: downloadFile,
        decryptFile: decryptFile
    };

}]);
sendshit.service('encryptor', ['$http', '$q', 'messages', 'triplesecProgress', function ($http, $q, messages, triplesecProgress) {

    var password;

    var generateKey = function() {

        var deferred = $q.defer();

        messages.addMsg('Generating key');

        triplesec.prng.generate(24, function(words) {

            password = words.to_hex();
            deferred.resolve(password);

        });

        return deferred.promise;

    };

    var encryptFile = function(name, file, password) {

        var deferred = $q.defer();

        messages.addMsg('Encrypting', true);

        triplesec.encrypt({

            data: new triplesec.Buffer(JSON.stringify({
                file: file,
                name: name
            })),

            key: new triplesec.Buffer(password),

            progress_hook: function (obj) {
                triplesecProgress.updateProgress(obj);
            }

        }, function(err, buff) {

            if (err) {
                return deferred.reject(err.message);
            }

            messages.addMsg('Encrypted');
            deferred.resolve(buff.toString('hex'));

        });

        return deferred.promise;

    };

    var uploadFile = function(encrypted) {

        var deferred = $q.defer();

        messages.addMsg('Uploading', true);

        var xhr      = new XMLHttpRequest();
        var formData = new FormData();
        var blob     = new Blob([encrypted], { type: 'application/octet-stream'});

        formData.append('file', blob, 'encrypted');

        xhr.upload.onprogress = function(e) {

            triplesecProgress.logProgress('Uploading', e.loaded/e.total);

        };

        xhr.onreadystatechange = function(e) {

            if (xhr.readyState == 4) {

                if (xhr.status === 200) {  

                    messages.addMsg('Done');
                    return deferred.resolve(location.origin + '/#/' + JSON.parse(xhr.response).id + '/' + password);

                } else {  

                    return deferred.reject("Error", xhr.statusText);  

                } 
            }
        };

        xhr.open('POST', 'upload', true);
        xhr.send(formData);

        return deferred.promise;

    };

    return {
        generateKey: generateKey,
        encryptFile: encryptFile,
        uploadFile: uploadFile
    };

}]);
sendshit.factory('fileReader', function($q, $window) {

    var readAsDataUrl = function(file) {

        var deferred = $q.defer();

        var reader   = new $window.FileReader();

        reader.onload = function(reader) {

            deferred.resolve({
                name: file.name,
                reader: reader.target.result
            });

        };

        reader.onerror = function(event) { 
            deferred.reject(event.target.error.name);
        };

        reader.readAsDataURL(file);

        return deferred.promise;

    };

    var readAsText = function(blob) {

        var deferred = $q.defer();

        var reader = new $window.FileReader();

        reader.onload = function(reader) {
            deferred.resolve(reader.target.result);
        };

        reader.onerror = function(event) { 
            deferred.reject(event.target.error.name);
        };

        reader.readAsText(blob);

        return deferred.promise;

    };

    return {
        readAsDataUrl: readAsDataUrl,
        readAsText: readAsText
    };

});