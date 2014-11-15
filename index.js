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
  CALLING: 2,
  CALL: 1,
  WAIT: 0,
};
var mode = MODE.WAIT;
var emotion = 0;

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
    emotion = data;
    statusChange(data);
  });
});

function statusChange(data) {
  switch (data) {
    case '0':
      ledLight(0, 0, 0);
      break;
    case '1':
      ledLight(1, 0.4, 0);
      break;
    case '2':
      ledLight(1, 0, 0);
      break;
    case '3':
      ledLight(0, 0, 1);
      break;
    case '4':
      ledLight(1, 0, 1);
      break;
  }
}

readPipeFile();
var before = 0;
function readPipeFile() {
  fs.readFile(filepath, 'utf8', function (err, data) {
    if (err) throw err;
    if (before != data) {
      console.log(data);
      before = data;
      if (data == '1') {
        mode = MODE.CALL;
      } else if (data == '2') {
        mode = MODE.CALLING;
        ledLight(0, 1, 0);
      } else {
        mode = MODE.WAIT;
        setTimeout(function () {
          ledLight(0, 0, 0);
        }, 50);
      }
      io.sockets.emit('statusChanged', 0);
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

exec('amixer set PCM 50');

var soundPlaying = false;
function soundPlay(type) {
  if (soundPlaying) return;
  console.log('sound 1');
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
  soundPlaying = true;
  exec('aplay ' + file);
  setTimeout(function() {
    console.log('sound 0');
    soundPlaying = false;
  }, 1500);
}

setInterval(function() {
  if (mode == MODE.CALL) {
    ledLight(0, 0, 0);
    setTimeout(function () {
      ledLight(Math.random(), Math.random(), Math.random());
    }, 50);
  }
}, 100);
