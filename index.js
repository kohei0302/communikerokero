var express = require('express');
var socket = require('socket.io');
var mraa = require('mraa');
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
        //writePipeFile(data);
        io.sockets.emit('statusChanged', data);
    }
  });
});

readPipeFile();
gpioPwmWrite(11, 0.5);

function readPipeFile() {
  fs.readFile(filepath, 'utf8', function (err, data) {
    if (err) throw err;
    console.log(data);
    readPipeFile();
  });
}

function gpioPwmWrite(pin, value) {
  var io = new mraa.Pwm(pin);
  io.period_us(700);
  io.enable(true);
  io.write(value);
}
