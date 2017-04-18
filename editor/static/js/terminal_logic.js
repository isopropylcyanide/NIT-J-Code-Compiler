function fill_iframe(data) {
    //fills iframe source with the given data
    $term_iframe = $('#terminal-iframe');
    $term_iframe.attr({
        'src': 'http://127.0.0.1:' + data,
    });
}

//show a confirmation dialog box when close terminal is clicked
$('#closeTerminal').bind('click', function(e) {
    e.preventDefault();
    new $.Zebra_Dialog('This will close the current terminal. <br> Reload if you wish to restart. <br><br><strong>Continue ?</strong>', {
    'type':     'question',
    'title':    'Stop terminal',
    'buttons':  [
                    {caption: 'Yes', callback: function() {
                        stopTerminal();
                    }},
                    {caption: 'No', callback: function() {
                    }},
                ]
});
});

//reload wetty instance on close
$('#reloadTerminal').bind('click', function(e) {
    e.preventDefault();
    new $.Zebra_Dialog('This will close the reload the terminal. <br> Any environment terminal changes would be lost. <br><br><strong>Continue ?</strong>', {
    'type':     'question',
    'title':    'Reload terminal',
    'buttons':  [
                    {caption: 'Yes', callback: function() {
                        reloadTerminal();
                    }},
                    {caption: 'No', callback: function() {
                    }},
                ]
});
});

var delay = (function() {
    //allows a delay of ms seconds
    var timer = 0;
    return function(callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();


//always close terminal when window is removed
window.onunload = stopTerminal;

function reloadTerminal() {
    // reloads terminal
    stopTerminal();
    loadTerminal();
}

function stopTerminal() {
    //stops the terminal instance and kills the wetty server
    return $.ajax({
        method: 'POST',
        url: "stopWettyTerm",
        data: {},
        success: function(data) {
            //this gets called when server returns an OK response
            //now remove menu item from tree
        },
        error: function(data) {}
    });
}


function loadTerminal() {
    //load terminal in the iframe by setting up a new wetty server
    //calls an AJAX request that fills the terminal with view when done
    return $.ajax({
        method: 'POST',
        url: "createWettyTerm",
        data: {},
        success: function(data) {
            //this gets called when server returns an OK response
            //fill iframe allowing certain seconds of terminal bootup time
            delay(function() {
                fill_iframe(data);
            }, 2000);
        },
        error: function(data) {}
    });
}

//output terminal fullscreen
$("#terminal-fullscreen").click(function(e) {
    e.preventDefault();
    var $panelhis = $(this);

    if ($panelhis.hasClass('glyphicon-resize-full')) {
        $panelhis.removeClass('glyphicon-resize-full');
        $panelhis.addClass('glyphicon-resize-small');
    } else if ($panelhis.hasClass('glyphicon-resize-small')) {
        $panelhis.removeClass('glyphicon-resize-small');
        $panelhis.addClass('glyphicon-resize-full');
    }
    $(this).closest('.panel').toggleClass('panel-fullscreen');
});
