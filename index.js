var express = require('express');
var socket = require('socket.io');
var fs = require('fs');
var app = express();
var server = app.listen(8080);
var io = socket(server);

var filepath = '/home/root/keropipe';

app.use('/', express.static(__dirname + '/htdocs'));
console.log('start web server');

io.on('connection', function (socket) {
  socket.on('statusChange', function (data) {
  data = data + '';
    switch (data) {
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
        console.log('data: ', data);
        writePipeFile(data);
        // pipeを使った場合、書き込みとcallbackの順序がバラバラなため、直後にステータスをwebに反映
        io.sockets.emit('statusChanged', data);
    }
  });
});

writePipeFile(0);

function writePipeFile(data)
{
  var buffer = new Buffer(data + "\n");
  fs.open(filepath, 'w', function(err, fd) {
    if (err) {
      throw 'error opening file: ' + err;
    } else {
      fs.write(fd, buffer, 0, buffer.length, null, function(err) {
        if (err) {
          throw 'error writing file: ' + err;
        }
        fs.close(fd, function() {
          console.log('file written: ' + data);
        });
      });
    }
  });
}
