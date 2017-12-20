'use strict';

var app = require('./server');
var port = 3000;

app.listen(port);
console.log('listening on http://localhost:' + port);