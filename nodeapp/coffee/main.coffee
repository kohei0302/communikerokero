$ = require('jquery')
io = require('socket.io-client')
socket = io.connect('/')

$ ->
    $('.btn').on 'click', ->
        if ($(this).hasClass('on'))
            socket.emit('statusChange', 0)
        else
            socket.emit('statusChange', $(this).data('value'))

    toggleHeader = ->
        $('.header').toggleClass('on')
        setTimeout(toggleHeader, 500)

    toggleHeader();

socket.on 'statusChanged', (data) ->
    $('.btn').removeClass('on')
    if (data != '0')
        $('.btn').filter( ->
            return parseInt($(this).data('value')) == parseInt(data)
        ).addClass('on')

