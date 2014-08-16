$ = require('jquery')

$ ->
    $('.btn').on 'click', ->
        $('.btn').not(this).removeClass('on');
        $(this).toggleClass('on')

    toggleHeader = ->
        $('.header').toggleClass('on')
        setTimeout(toggleHeader, 500)

    toggleHeader();
