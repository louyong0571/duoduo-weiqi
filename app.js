var express = require('express');

var app = express();

app.use(express.static(__dirname + '/static'))

app.listen(3000, function () {
 console.log('app is listening at port 3000');
});

