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
        io.sockets.emit('statusChanged', data);
    }
    switch (data) {
      case '0':
        ledLight(0, 0, 0);
        break;
      case '1':
        ledLight(0, 1, 1);
        break;
      case '2':
        ledLight(1, 0, 0);
        break;
      case '3':
        ledLight(0, 0, 1);
        break;
      case '4':
        ledLight(1, 1, 0);
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

var pwmpin = {};
function gpioPwmWrite(pin, value) {
  if (typeof pwmpin[pin] === 'undefined') {
    pwmpin[pin] = new mraa.Pwm(pin);
    pwmpin[pin].period_us(700);
    pwmpin[pin].enable(true);
  }
  pwmpin[pin].write(value);
}

function ledLight(red, green, blue) {
  gpioPwmWrite(9, red);
  gpioPwmWrite(10, green);
  gpioPwmWrite(11, blue);
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
    ledLight(Math.random(), Math.random(), Math.random());
  }
  setTimeout(illuminate, 50);
}
