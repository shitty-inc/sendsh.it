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