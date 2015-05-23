if(!window.FileReader || !window.FormData || !window.File || !window.Blob) {
	sendshit.logMessage('Your browser does not support required features.');
}

var hash = location.href.substr(location.href.indexOf('#')+1);

sjcl.random.startCollectors();

$(function() {

    $('#encrypt-input').bootstrapFileInput();

	if(hash != location.href) {

		sendshit.download(hash.split('/')[0], hash.split('/')[1]);

	} else {

        $('.encrypt').removeClass('hide');

		$('#encrypt-input').change(function(e) {

            var files = e.target.files;

			if(files.length != 1) {
				sendshit.logMessage('Please select a file to encrypt!');
				return false;
			}

			var file = e.target.files[0];

            if(file.size > 5000000) {
                sendshit.logMessage('File must be under 5MB');
                return false;
            }

			sendshit.logMessage('Generating key', true);

			if (sjcl.random.getProgress(10)) {
				sendshit.encrypt(file);
			} else {
				sjcl.random.addEventListener('seeded', function() {
			        sendshit.encrypt(file);
			    });
			}

		});

	}

	NProgress.configure({
		trickle: false,
		ease: 'linear', 
		speed: 1,
        minimum: 0.1
	});

});

function SelectAll(id) {
    document.getElementById(id).focus();
    document.getElementById(id).select();
}

var sendshit = (function () {

    var sendshit = {},
        password = '',
        reader   = new FileReader();

    sendshit.encrypt = function (file) {
        
        reader.onload = function (e) {

            password = sjcl.random.randomWords(6,10);

            if (typeof password !== 'string') {
                password = sjcl.codec.hex.fromBits(password);
            }
            password = password.replace(/ /g,'').replace(/(.{8})/g, "$1").replace(/ $/, '');

            NProgress.start();

            sendshit.logMessage('Encrypting', true);

            triplesec.encrypt ({

                data: new triplesec.Buffer(JSON.stringify({
                    file: e.target.result,
                    name: file.name
                })),

                key: new triplesec.Buffer(password),

                progress_hook: function (obj) {
                    _triplesecProgress(obj);
                }

            }, function(err, buff) {

                NProgress.done();

                sendshit.logMessage('Encrypted');
              
                if (! err) { 

                    NProgress.start();

                    sendshit.logMessage('Uploading', true);

                    var encrypted = buff.toString('hex');
                    var formData  = new FormData();
                    var blob      = new Blob([encrypted], { type: 'application/octet-stream'});

                    formData.append('file', blob, 'encrypted');
                    formData.append('_token', $('[name="csrf_token"]').attr('content'));

                    $.ajax({

                        type: 'post',
                        url: 'upload',
                        data: formData,
                        xhr: function() {

                            var myXhr = $.ajaxSettings.xhr();

                            if(myXhr.upload){

                                myXhr.upload.addEventListener('progress', function(e) {

                                    var done = e.position || e.loaded, total = e.totalSize || e.total;
                                    sendshit.logMessage('Upload progress: ' + (Math.floor(done/total*1000)/10) + '%');
                                    NProgress.set(Math.floor(done/total*10)/10);

                                }, false);

                            }

                            return myXhr;
                        },
                        success: function (data) {

                            NProgress.done();

                            sendshit.logMessage('Done');

                            $('#link').val(location.href+'#'+data.id+'/'+password);

                            $('.link-group').removeClass('hide');
                            $('.file-group').addClass('hide');

                        },
                        error: function (jqxhr) {

                            NProgress.done();

                            var error = JSON.parse(jqxhr.responseText);

                            sendshit.logMessage(error.file);

                        },

                        cache: false,
                        processData: false,
                        contentType: false
                    });
                }
            });
        };

        sendshit.logMessage('Reading file', true);

        reader.readAsDataURL(file);

    };

    sendshit.download = function (id, key) {

        password = key;

        sendshit.logMessage('Downloading', true);

        $.get('download?id=' + id, function(data) {

            if(data.error){

                sendshit.logMessage(data.error);

            } else {

                sendshit.logMessage('Downloaded');
                decrypt(data);

            }
        });

    };

    var decrypt = function (data) {

        reader.onload = function(e){

            NProgress.start();

            sendshit.logMessage('Decrypting', true);

            triplesec.decrypt ({  

                data: new triplesec.Buffer(e.target.result, 'hex'),
                key:  new triplesec.Buffer(password),

                progress_hook: function (obj) {
                    _triplesecProgress(obj);
                }

            }, function (err, buff) { 

                NProgress.done(); 

                sendshit.logMessage('Decrypted');

                if (err) {

                    sendshit.logMessage(err.message);
                    return false;

                }

                var decrypted  = JSON.parse(buff.toString());
                var mimeString = decrypted.file.split(',')[0].split(':')[1].split(';')[0];
                var blob       = _b64toBlob(decrypted.file.split(',')[1], mimeString);

                saveAs(blob, decrypted.name);

                sendshit.logMessage('Done');

            });

        };

        var blob = new Blob([data], {type: 'application/octet-stream'});
        reader.readAsText(blob);


    };

    sendshit.logMessage = function (message, ellipsis) {

        ellipsis = typeof ellipsis !== 'undefined' ? ellipsis : false;

        if(ellipsis === true) {
            message = message + '<i class="ellipsis"><i>.</i><i>.</i><i>.</i></i>';
        }

        $('#status').html(message);

        if (!window.console){
            console.log(message);
        }

    };

    var _triplesecProgress = function (obj) {

        var percent = obj.i / obj.total;

        if(obj.what == 'pbkdf2 (pass 1)' || obj.what == 'pbkdf2 (pass 2)'){
            console.log('Running PBKDF2: '+Math.round(percent * 100)+'%');
            NProgress.set(parseFloat(percent.toFixed(1)));
        }

        if(obj.what == 'scrypt'){
            console.log('Scrypt: '+Math.round(percent * 100)+'%');
            NProgress.set(parseFloat(percent.toFixed(1)));
        }

        if(obj.what == 'salsa20'){
            console.log('Salsa20: '+Math.round(percent * 100)+'%');
            NProgress.set(parseFloat(percent.toFixed(1)));
        }

        if(obj.what == 'twofish'){
            console.log('Twofish-CTR: '+Math.round(percent * 100)+'%');
            NProgress.set(parseFloat(percent.toFixed(1)));
        }

        if(obj.what == 'aes'){
            console.log('AES-256-CTR: '+Math.round(percent * 100)+'%');
            NProgress.set(parseFloat(percent.toFixed(1)));
        }

        if(obj.what == 'HMAC-SHA512-SHA3'){
            console.log('Generating HMAC: '+Math.round(percent * 100)+'%');
            NProgress.set(parseFloat(percent.toFixed(1)));
        }               

    };

    // http://stackoverflow.com/a/16245768
    var _b64toBlob = function (b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

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

    return sendshit;

}());