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