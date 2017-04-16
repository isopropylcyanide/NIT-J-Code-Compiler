function fill_iframe(data) {
    //fills iframe source with the given data
    $term_iframe = $('#terminal-iframe');
    $term_iframe.attr({
        'src': 'http://127.0.0.1:' + data,
    });
}

var delay = (function() {
    //allows a delay of ms seconds
    var timer = 0;
    return function(callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();


//always close terminal when window is removed
window.onbeforeunload = stopTerminal;

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
