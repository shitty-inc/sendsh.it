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