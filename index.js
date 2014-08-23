var express = require('express');
var socket = require('socket.io');
var mraa = require('mraa');
var fs = require('fs');
var app = express();
var server = app.listen(8080);
var io = socket(server);
var exec = require('child_process').exec;

var filepath = '/home/root/keropipe';

var MODE = {
  CALL: 1,
  WAIT: 0,
};
var mode = MODE.WAIT;

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
        soundPlay(data);
        gpioPwmWrite(11, 1);
        io.sockets.emit('statusChanged', data);
    }
    switch (data) {
      case '1':
        gpioPwmWrite(9, 1);
        gpioPwmWrite(10, 0);
        gpioPwmWrite(11, 0);
        break;
      case '2':
        gpioPwmWrite(9, 0);
        gpioPwmWrite(10, 0);
        gpioPwmWrite(11, 1);
        break;
      case '3':
        gpioPwmWrite(9, 0);
        gpioPwmWrite(10, 1);
        gpioPwmWrite(11, 0);
        break;
      case '4':
        gpioPwmWrite(9, 0);
        gpioPwmWrite(10, 1);
        gpioPwmWrite(11, 1);
        break;
    }
  });
});

readPipeFile();

function readPipeFile() {
  fs.readFile(filepath, 'utf8', function (err, data) {
    if (err) throw err;
    console.log(data);
    if (data == '1') {
      mode = MODE.CALL;
    } else {
      mode = MODE.WAIT;
      gpioPwmWrite(9, 0);
      gpioPwmWrite(10, 0);
      gpioPwmWrite(11, 0);
    }
    readPipeFile();
  });
}

var io = [];
function gpioPwmWrite(pin, value) {
  if (typeof io[pin] !== 'undefined') {
    io[pin] = new mraa.Pwm(pin);
    io[pin].period_us(700);
    io[pin].enable(true);
  }
  io[pin].write(value);
}

exec('amixer set PCM 151');

function soundPlay(type) {
  var file = './htdocs/sound/';
  switch (type) {
    case '1':
      file += 'niconico.wav';
      break;
    case '2':
      file += 'punpun.wav';
      break;
    case '3':
      file += 'shikushiku.wav';
      break;
    case '4':
      file += 'runrun.wav';
      break;
    default:
      return;
  }
  exec('aplay ' + file);
}

illuminate();
function illuminate() {
  if (mode == MODE.CALL) {
    gpioPwmWrite(9, Math.random());
    gpioPwmWrite(10, Math.random());
    gpioPwmWrite(11, Math.random());
  }
  setTimeout(illuminate, 10);
}
