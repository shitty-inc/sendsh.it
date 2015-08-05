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