function displayOutput(data) {
    //display output
    document.getElementById('stdoutput').innerText = data;
}

// Create codemirror instance
var editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
    lineNumbers: true,
    lineWrapping: true,
    matchBrackets: true,
    mode: "text/x-c",
    styleActiveLine: true
});


var openFile = function(event) {
    // button that browses file and pastes content into editor
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function() {
        var text = reader.result;
        //Display the loaded file from the client onto the browser
        editor.setValue(text);
        document.getElementById("fname").value = input.files[0].name;
    };
    reader.readAsText(input.files[0]);
};

function langChange(obj) {
    //Listener on language choose spinner
    document.getElementById('fileButton').value = "";
    if (obj.value == "c") {
        editor.setOption("mode", "text/x-c");
        editor.setValue("/*\n  Your C code goes here\n  Main method should return 0\n*/");
        document.getElementById('fname').value = ''
    } else if (obj.value == "cpp") {
        document.getElementById('fname').value = ''
        editor.setOption("mode", "text/x-c++src");
        editor.setValue("/*\n  Your C++ code goes here\n  Main method should return 0\n*/");
    } else if (obj.value == "py") {
        document.getElementById('fname').value = ''
        editor.setOption("mode", "text/x-python")
        editor.setValue("#Your Python code goes here");
    } else if (obj.value == "java") {
        document.getElementById('fname').value = ''
        editor.setOption("mode", "text/x-java");
        editor.setValue("/*\n  Your Java code goes here\n  Name of class should be kept as main and public\n  If using a custom name to save the file, change the name of a class to the name of the program \n*/");
    }
}

function selectTheme() {
    //select theme from dropdowns
    var input = document.getElementById("selectTheme");
    var theme = input.options[input.selectedIndex].textContent;
    if (theme === "default-theme")
        editor.setOption("theme", "default");
    else
        editor.setOption("theme", theme);
}


function sleep(miliseconds) {
    //sleep for ms time
    var currentTime = new Date().getTime();

    while (currentTime + miliseconds >= new Date().getTime()) {}
}

function initializeTree(){
    $('#filetreepanel').fancytree({
        activeVisible: false, // Make sure, active nodes are visible (expanded)
        aria: false, // Enable WAI-ARIA support
        autoActivate: true, // Automatically activate a node when it is focused using keyboard
        autoCollapse: false, // Automatically collapse all siblings, when a node is expanded
        autoScroll: false, // Automatically scroll nodes into visible area
        clickFolderMode: 4, // 1:activate, 2:expand, 3:activate and expand, 4:activate (dblclick expands)
        checkbox: false, // Show checkboxes
        debugLevel: 0, // 0:quiet, 1:normal, 2:debug
        disabled: false, // Disable control
        focusOnSelect: false, // Set focus when node is checked by a mouse click
        escapeTitles: false, // Escape `node.title` content for display
        generateIds: false, // Generate id attributes like <span id='fancytree-id-KEY'>
        idPrefix: "ft_", // Used to generate node id´s like <span id='fancytree-id-<key>'>
        icon: true, // Display node icons
        keyboard: true, // Support keyboard navigation
        keyPathSeparator: "/", // Used by node.getKeyPath() and tree.loadKeyPath()
        minExpandLevel: 1, // 1: root node is not collapsible
        quicksearch: true, // Navigate to next node by typing the first letters
        rtl: false, // Enable RTL (right-to-left) mode
        selectMode: 2, // 1:single, 2:multi, 3:multi-hier
        tabindex: "0", // Whole tree behaves as one single control
        titlesTabbable: false, // Node titles can receive keyboard focus
        tooltip: true // Use title as tooltip (also a callback could be specified)
    });
}

$(document).ready(function() {

    $.ajax({
        type: "POST",
        url: "refreshDirectory",
        success: function(data) {
            console.log('refresh: ' + data);
            // Add the dom result and refancy the tree
             $('#filetreepanel ul').append(data);
            initializeTree();
        },
        error: function(qXHR, textStatus,errorThrown){
                 $('#filetreepanel ul').append('<h2>Error retrieving directory structure</h2>');
        }
     });

    //Fire onchange event automatically
    $('#languageSelect').trigger("change");
    //Allow only certain file extensions
    $('#fileButton').attr({
        'accept': '.c,.cpp,.java,.py'
    });

    //file-tree
    initializeTree();

    // button that browses file and pastes content into editor
    $('fileButton').click(function(event) {
        var input = event.target;
        var reader = new FileReader();
        reader.onload = function() {
            var text = reader.result;
            //Display the loaded file from the client onto the browser
            console.log(text);
            editor.setValue(text);
            document.getElementById("fname").value = input.files[0].name;
        };
        reader.readAsText(input.files[0]);
    });

    //reset code when clicked
    $('#clearButton').click(function() {
        //clear code and set it to whatever language currently exists
        editor.setValue("");
        document.getElementById("languageSelect").onchange();
        new $.Zebra_Dialog('<strong>Cleared</strong> editor', {
            'buttons': false,
            'modal': false,
            'position': ['right - 20', 'top + 20'],
            'auto_close': 500
        });
    });

    $('#clearOutputWindow').click(function() {
        //clear output window in editor
        displayOutput("");
    });

    //toggle stdin response windows
    $('#stdinButton').click(function() {
        // $('#stdinput').toggle('fast');
        $('textarea#stdinput').html('');
    });

    // Saves file at the remote directory using an AJAX call
    //  check file name not empty
    $('#saveButton').click(function() {
        var sourceName = $('#fname').val();
        if (sourceName == "") {
            new $.Zebra_Dialog('File name cannot be <strong>empty</strong>', {
                'buttons': false,
                'modal': false,
                'position': ['right - 20', 'top + 20'],
                'auto_close': 1500,
                'type': 'error',
                'title': 'Error',
            });
        } else {
            var sourceCode = editor.getValue();
            var sourceLang = $("#languageSelect").val();
            $.ajax({
                method: 'POST',
                url: "saveFile",
                data: {
                    'sourceCode': sourceCode,
                    'sourceLang': sourceLang,
                    'sourceName': sourceName
                },
                success: function(data) {
                    //this gets called when server returns an OK response
                    new $.Zebra_Dialog(data, {
                        'buttons': false,
                        'modal': false,
                        'position': ['right - 20', 'top + 20'],
                        'auto_close': 1500,
                        'type': 'confirmation'
                    });
                },
                error: function(data) {
                    new $.Zebra_Dialog("Error occured during file save: " + data, {
                        'buttons': false,
                        'modal': false,
                        'position': ['right - 20', 'top + 20'],
                        'auto_close': 1500,
                        'type': 'error',
                        'title': 'Error',
                    });
                }
            });
        }
    });

    //Compiles code at the server by sending UI Data and outputting the response
    $('#executeButton').click(function() {
        // displayLoadingSpinner();
        console.log("pressed execute");

        var sourceCode = editor.getValue();
        var sourceLang = document.getElementById("languageSelect").value;
        var sourceInp = document.getElementById("stdinText").value;
        var sourceName = document.getElementById("fname").value;
        if (sourceName == "") {
            //user didn't specify a file name. Default to main
            sourceName = "main";
        }
        $.ajax({
            method: 'POST',
            url: "execute",
            data: {
                'sourceCode': sourceCode,
                'sourceLang': sourceLang,
                'sourceInp': sourceInp,
                'sourceName': sourceName
            },
            success: function(data) {
                //this gets called when server returns an OK response
                displayOutput(data);
            },
            error: function(data) {
                new $.Zebra_Dialog("Error occured during execution: " + data, {
                    'buttons': false,
                    'modal': false,
                    'position': ['right - 20', 'top + 20'],
                    'auto_close': 1500,
                    'type': 'error',
                    'title': 'Error',
                });
            }
        });
    });

    // Stdin panel toggle when custom input is clicked
    $('#stdinButton').click(function(event) {
        event.preventDefault();
        var $panel = $('#stdinPanel');
        var $text = $('#stdinText');

        $panel.slideToggle("fast");

    });

    //clear stdin textarea when stdinClearButton is clicked
    $('#stdinClearButton').click(function(event) {
        $('#stdinText').val("");
    });


    //output window toggle fullscreen
    $("#panel-fullscreen").click(function(e) {
        e.preventDefault();
        var $panelhis = $(this);

        if ($panelhis.children('i').hasClass('glyphicon-resize-full')) {
            $panelhis.children('i').removeClass('glyphicon-resize-full');
            $panelhis.children('i').addClass('glyphicon-resize-small');
        } else if ($panelhis.children('i').hasClass('glyphicon-resize-small')) {
            $panelhis.children('i').removeClass('glyphicon-resize-small');
            $panelhis.children('i').addClass('glyphicon-resize-full');
        }
        $(this).closest('.panel').toggleClass('panel-fullscreen');
    });
});
