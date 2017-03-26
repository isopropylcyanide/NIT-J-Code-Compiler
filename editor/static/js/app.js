function displayOutput(data) {
    //display output in output window
    document.getElementById('stdoutput').innerText = data;
}

var editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
    // Create codemirror instance
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
        var _file_less_ext = (input.files[0].name).replace(/\..+$/, '');
        document.getElementById("fname").value = _file_less_ext;
    };
    reader.readAsText(input.files[0]);
};

function langChange(obj) {
    //Listener on language choose spinner
    document.getElementById('fileButton').value = "";
    if (obj.value === "c") {
        editor.setOption("mode", "text/x-c");
        editor.setValue("/*\n  Your C code goes here\n  Main method should return 0\n*/");
        document.getElementById('fname').value = '';
    } else if (obj.value === "cpp") {
        document.getElementById('fname').value = '';
        editor.setOption("mode", "text/x-c++src");
        editor.setValue("/*\n  Your C++ code goes here\n  Main method should return 0\n*/");
    } else if (obj.value === "py") {
        document.getElementById('fname').value = '';
        editor.setOption("mode", "text/x-python");
        editor.setValue("#Your Python code goes here");
    } else if (obj.value === "") {
        document.getElementById('fname').value = '';
        editor.setOption("mode", "text/plain");
        editor.setValue("");
    } else if (obj.value === "java") {
        document.getElementById('fname').value = '';
        editor.setOption("mode", "text/x-java");
        editor.setValue("/*\n  Your Java code goes here\n  Name of class should be kept as main and public\n  If using a custom name to save the file, change the name of a class to the name of the program \n*/");
    }
}

function selectTheme() {
    //select theme from dropdown -> triggered by default
    var input = document.getElementById("selectTheme");
    var theme = input.options[input.selectedIndex].textContent;
    if (theme === "default-theme")
        editor.setOption("theme", "default");
    else
        editor.setOption("theme", theme);
}


function fillEditorView(content, filename) {
    //fill codemirror editor with content
    //Change mode to the one represented by the file
    var ext = filename.split('.')[1];
    var $lang = $('#languageSelect');
    if (txt === "")
        $lang.val("txt");
    else
        $lang.val(txt);
    $lang.trigger("change");
    editor.setValue(content);
}

/*---------------------------FANCY tree customiation--------------------------*/
glyph_opts = {
    map: {
        doc: "glyphicon glyphicon-file",
        docOpen: "glyphicon glyphicon-file",
        checkbox: "glyphicon glyphicon-unchecked",
        checkboxSelected: "glyphicon glyphicon-check",
        checkboxUnknown: "glyphicon glyphicon-share",
        dragHelper: "glyphicon glyphicon-play",
        dropMarker: "glyphicon glyphicon-arrow-right",
        error: "glyphicon glyphicon-warning-sign",
        expanderClosed: "glyphicon glyphicon-menu-right",
        expanderLazy: "glyphicon glyphicon-menu-right", // glyphicon-plus-sign
        expanderOpen: "glyphicon glyphicon-menu-down", // glyphicon-collapse-down
        folder: "glyphicon glyphicon-folder-close",
        folderOpen: "glyphicon glyphicon-folder-open",
        loading: "glyphicon glyphicon-refresh glyphicon-spin"
    }
};

function getRemotePath(node) {
    // given a tree node, recurse and return the absolute path for the remote
    var path = node.title;
    if (path === 'root')
        return path;
    while (node.parent.title != 'root') {
        node = node.parent;
        path = node.title + '/' + path;
    }
    return path;
}

var treeOptions = {
    //options for fancy tree
    extensions: ["glyph", "edit", "childcounter", "contextMenu"],
    contextMenu: {
        menu: function(node) {
            if (node.folder) {
                return  {
                    "add_folder": {
                        "name": "Add folder",
                        "icon": "add"
                    },
                    "delete": {
                        "name": "Delete",
                        "icon": "delete"
                    },
                    "rename": {
                        "name": "Rename",
                        "icon": "edit"
                    }
                };
            } else return  {
                "open": {
                    "name": "Open",
                    "icon": "quit"
                },
                "delete": {
                    "name": "Delete",
                    "icon": "delete"
                },
                "rename": {
                    "name": "Rename",
                    "icon": "edit"
                }
            };
        },
        actions: function(node, action, options) {
            var path = getRemotePath(node);

            switch (action) {
                case "open":
                    //open file in the editor
                    displayFileinEditor(path, node.title);
                    break;
                case "delete":
                    //remove file from the user directory
                    deleteFileFromUserDirectory(path, node);
                    break;
                case "rename":
                    //rename file given by path to something new
                    node.editStart();
                    break;
                default:
                    break;
            }
        }
    },
    edit: {
        triggerStart: ["f2", "shift+click", "mac+enter"],
        beforeEdit: function(event, data) {
        },
        edit: function(event, data) {
        },
        save: function(event, data) {
            data.node.oldName = data.node.title;
            return true;
        },
        close: function(event, data) {
            // Editor was removed
            if (data.save){
                // var parentPath = getRemotePath(data.node.parent);
                // Since we started an async request, mark the node as preliminary
                renameRemoteFile(data.node.parent, data.node.title, data.node.oldName);
            }
        }
    },
    childcounter: {
        deep: true,
        hideZeros: true,
        hideExpanded: true
    },
    loadChildren: function(event, data) {
        // update node and parent counters after lazy loading
        data.node.updateCounters();
    },

    glyph: glyph_opts,
    toggleEffect: {
        effect: "drop",
        options: {
            direction: "left"
        },
        duration: 400
    },

    autoActivate: true, // Automatically activate a node when it is focused using keyboard
    autoScroll: true, // Automatically scroll nodes into visible area
    clickFolderMode: 4, // 1:activate, 2:expand, 3:activate and expand, 4:activate (dblclick expands)
    idPrefix: "ft_", // Used to generate node id´s like <span id='fancytree-id-<key>'>
    icon: true, // Display node icons
    keyboard: true, // Support keyboard navigation
    keyPathSeparator: "/", // Used by node.getKeyPath() and tree.loadKeyPath()
    minExpandLevel: 1, // 1: root node is not collapsible
    quicksearch: true, // Navigate to next node by typing the first letters
    selectMode: 1, // 1:single, 2:multi, 3:multi-hier
    tabindex: "0", // Whole tree behaves as one single control
    dataType: "json",
    source: {
        url: "refreshDirectory"
    },
    dblclick: (function(event, data) {
        // A node was double clicked
        //Extract its full path and view if not a folder
        var node = data.node;
        if (node.folder)
            return;

        //Display the file in the editor
        var path = getRemotePath(node);
        displayFileinEditor(path, node.title);
    })
};

/*---------------------------FANCY tree customiation ends--------------------------*/


function renameRemoteFile(parNode, newName, oldName) {
    //AJAX call to remove file from user directory
    //also delete the file from tree
    //Display the file in the editor
    var parent_path = getRemotePath(parNode).replace('root','.') + '/';
    var remote_path = parent_path + oldName;
    var new_path = parent_path + newName;
    return $.ajax({
        method: 'POST',
        url: "renameRemoteFile",
        data: {
            'remote_path': remote_path,
            'new_path': new_path
        },
        success: function(data) {
            //this gets called when server returns an OK response
            //now remove menu item from tree
            new $.Zebra_Dialog(data, {
                'buttons': false,
                'modal': false,
                'position': ['right - 20', 'top + 20'],
                'auto_close': 1500,
                'type': 'confirmation',
                'title': newName
            });
        },
        error: function(data) {
            new $.Zebra_Dialog("Error occured while renaming: " + data.responseText, {
                'buttons': false,
                'modal': false,
                'position': ['right - 20', 'top + 20'],
                'auto_close': 1500,
                'type': 'error',
                'title': newName
            });
        }
    });
}

function deleteFileFromUserDirectory(path, node) {
    //AJAX call to remove file from user directory
    //also delete the file from tree
    //Display the file in the editor
    return $.ajax({
        method: 'POST',
        url: "deleteRemoteDir",
        data: {
            'remote_path': path
        },
        success: function(data) {
            //this gets called when server returns an OK response
            //now remove menu item from tree
            new $.Zebra_Dialog(data, {
                'buttons': false,
                'modal': false,
                'position': ['right - 20', 'top + 20'],
                'auto_close': 1500,
                'type': 'confirmation',
                'title': node.title
            });
            //refresh file tree again
            node.remove();

            //if deleted file was currently active in the text editor, erase its contents
            var $fname = $('#fname');
            if ($fname.val() === node.title)
                $('#clearButton').trigger('click');

        },
        error: function(data) {
            new $.Zebra_Dialog("Error occured while deleting: " + data.responseText, {
                'buttons': false,
                'modal': false,
                'position': ['right - 20', 'top + 20'],
                'auto_close': 1500,
                'type': 'error',
                'title': node.title
            });
        }
    });

}

function displayFileinEditor(path, original_name) {
    //Display the file in the editor and sets the filename label as original_name
    return $.ajax({
        method: 'POST',
        url: "viewfilecontents",
        data: {
            'remote_path': path
        },
        success: function(data) {
            //this gets called when server returns an OK response
            fillEditorView(data, original_name);
            $('#fname').val(original_name);
        },
        error: function(data) {
            new $.Zebra_Dialog("Error occured while viewing: " + data.responseText, {
                'buttons': false,
                'modal': false,
                'position': ['right - 20', 'top + 20'],
                'auto_close': 1500,
                'type': 'error',
                'title': original_name
            });
        }
    });
}

$(document).ready(function() {

    //initialize file tree on document load
    $('#filetreepanel').fancytree(treeOptions);
    $('#treeData.fancytree-container').addClass('nopadding');

    //Fire onchange event automatically
    $('#languageSelect').trigger("change");
    selectTheme();

    //Allow only certain file extensions
    $('#fileButton').attr({
        'accept': '.c,.cpp,.java,.py'
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
        if (sourceName === "") {
            new $.Zebra_Dialog('File name cannot be <strong>empty</strong>', {
                'buttons': false,
                'modal': false,
                'position': ['right - 20', 'top + 20'],
                'auto_close': 1500,
                'type': 'error',
                'title': 'Error',
            });
        } else {
            //AJAX request to save file at the server if user confirms
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
                        'type': 'confirmation',
                        'title': sourceName
                    });
                    //refresh file tree again
                    $.ui.fancytree.getTree("#filetreepanel").reload({
                        url: "refreshDirectory"
                    });

                },
                error: function(data) {
                    new $.Zebra_Dialog("Error occured during file save: " + data.responseText, {
                        'buttons': false,
                        'modal': false,
                        'position': ['right - 20', 'top + 20'],
                        'auto_close': 1500,
                        'type': 'error',
                        'title': sourceName + '.' + sourceLang
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
        if (sourceName === "") {
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
                new $.Zebra_Dialog("Error occured during execution: " + data.responseText, {
                    'buttons': false,
                    'modal': false,
                    'position': ['right - 20', 'top + 20'],
                    'auto_close': 1500,
                    'type': 'error',
                    'title': 'Program',
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
