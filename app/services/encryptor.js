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