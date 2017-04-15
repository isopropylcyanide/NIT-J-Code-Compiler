/*jshint esversion: 6 */

function displayOutput(data) {
    //display output in output window
    document.getElementById('stdoutput').innerText = data;
}

var openFile = function(event) {
    // button that browses file and pastes content into editorList.getActiveEditor()
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function() {
        var text = reader.result;
        //Display the loaded file from the client onto the browser
        editorList.getActiveEditor().setValue(text);
        var _file_less_ext = (input.files[0].name).replace(/\..+$/, '');
        document.getElementById("fname").value = _file_less_ext;
    };
    reader.readAsText(input.files[0]);
};

function getLanguageMode(lang){
    //get codemirror mode corresponding to the language
    if (lang === "C") {
        return "text/x-c";
    } else if (lang === "C++") {
        return "text/x-c++src";
    } else if (lang === "Python") {
        return "text/x-python";
    } else if (lang === "Java") {
        return "text/x-java";
    }else
        return "text/plain";
}

function langChange(obj) {
    //Listener on language choose spinner
    document.getElementById('fileButton').value = "";
    let langText = obj.options[obj.selectedIndex].innerText;
    let mode = getLanguageMode(langText);
    editorList.getActiveEditor().setOption("mode", mode);
    editorList.setActiveEditorLang(langText);
    document.getElementById('fname').value = '';
}

function selectRandomEditorTheme(){
    //select a random theme on a new tab
    var $options = $('#selectTheme').find('option'),
    random = ~~(Math.random() * $options.length);
    $options.eq(random).prop('selected', true);
    $select = $('#selectTheme');
    let value = $select.find('option:eq(' + random + ')').val();
    $select.val(value).change();
}
function selectTheme() {
    //select theme from dropdown -> triggered by default
    var input = document.getElementById("selectTheme");
    var theme = input.options[input.selectedIndex].textContent;
    editorList.getActiveEditor().setOption("theme", theme);
}


function fillEditorView(content, filename) {
    //fill codemirror editorList.getActiveEditor() with content
    //Change mode to the one represented by the file
    var ext = filename.split('.')[1];
    var $lang = $('#languageSelect');
    var extArray = ['cpp', 'c', 'java', 'py'];
    if (extArray.indexOf(ext) <= -1)
        $lang.val("");
    else
        $lang.val(ext);
    $lang.trigger("change");
    editorList.getActiveEditor().setValue(content);
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



function makeRemoteDirectory(node, childNode, isFile = "False") {
    //AJAX call to add a remote directory
    ///node is the place where you add a childnode given by childNode
    var saveNode = node;
    var parent_path = getRemotePath(saveNode) + '/';
    var remote_path = parent_path + childNode.title;

    return $.ajax({
        method: 'POST',
        url: "makeRemoteDirectory",
        data: {
            'remote_path': remote_path,
            'is_file': isFile
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
                'title': childNode.title
            });
            //successful result. update child in tree
            node.editCreateNode("child", childNode);
        },
        error: function(data) {
            new $.Zebra_Dialog("Error occured while creating: " + "<br><br>" + data.responseText, {
                'buttons': false,
                'modal': false,
                'position': ['right - 20', 'top + 20'],
                'auto_close': 1500,
                'type': 'error',
                'title': childNode.title
            });
        }
    });
}

function renameRemoteFile(parNode, newName, oldName) {
    //AJAX call to remove file from user directory
    //also delete the file from tree
    //Display the file in the editorList.getActiveEditor()
    var node = parNode;
    var parent_path = getRemotePath(parNode) + '/';
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
            new $.Zebra_Dialog("Error occured while renaming: " + "<br><br>" + data.responseText, {
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
    //Display the file in the editorList.getActiveEditor()
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
            //remove  node
            node.remove();
            //if deleted file was currently active in the text editorList.getActiveEditor(), erase its contents
            var $fname = $('#fname');
            if ($fname.val() === node.title)
                $('#clearButton').trigger('click');
        },
        error: function(data) {
            new $.Zebra_Dialog("Error occured while deleting: " + "<br><br>" + data.responseText, {
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
    //Display the file in the editorList.getActiveEditor() and sets the filename label as original_name
    return $.ajax({
        method: 'POST',
        url: "viewfilecontents",
        data: {
            'remote_path': path
        },
        success: function(data) {
            //this gets called when server returns an OK response
            fillEditorView(data, original_name);
            var _file_less_ext = (original_name).replace(/\..+$/, '');
            $('#fname').val(_file_less_ext);
        },
        error: function(data) {
            new $.Zebra_Dialog("Error occured while viewing: " + "<br><br>" + data.responseText, {
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
    $('#tabs').tabs();
    $('#add-tab').trigger("click");
    $('#languageSelect').trigger("change");

    //Allow only certain file extensions
    $('#fileButton').attr({
        'accept': '.c,.cpp,.java,.py'
    });

    //initialize editor tab panel
    $("#tabs").tabs();


    //reset code when clicked
    $('#clearButton').click(function() {
        //clear code and set it to whatever language currently exists
        editorList.getActiveEditor().setValue("");
        document.getElementById("languageSelect").onchange();
        new $.Zebra_Dialog('<strong>Cleared</strong> editorList.getActiveEditor()', {
            'buttons': false,
            'modal': false,
            'position': ['right - 20', 'top + 20'],
            'auto_close': 500
        });
    });

    $('#clearOutputWindow').click(function() {
        //clear output window in editorList.getActiveEditor()
        // var root = $('#filetreepanel').fancytree("getRootNode");
        // root.sortChildren(tree_comparator, true);
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
                'type': 'information',
                'title': 'Save file name',
            });
        } else {
            //Save file..must include the directory of the active folder
            var sourceCode = editorList.getActiveEditor().getValue();
            var sourceLang = $("#languageSelect").val();
            var currentNode = $('#filetreepanel').fancytree("getActiveNode");

            var savePath = "";
            if (currentNode === null) {
                //save at the root location instead
                new $.Zebra_Dialog('Select a <strong>folder</strong>', {
                    'buttons': false,
                    'modal': false,
                    'position': ['right - 20', 'top + 20'],
                    'auto_close': 1000
                });
                return;
            } else if (!(currentNode.folder)) {
                new $.Zebra_Dialog('Select a <strong>folder</strong><br><br> File Selected', {
                    'buttons': false,
                    'modal': false,
                    'position': ['right - 20', 'top + 20'],
                    'auto_close': 1000
                });
                return;
            } else savePath = getRemotePath(currentNode);
            $.ajax({
                method: 'POST',
                url: "saveFile",
                data: {
                    'sourceCode': sourceCode,
                    'sourceLang': sourceLang,
                    'sourceName': sourceName,
                    'remotePath': savePath
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
                    new $.Zebra_Dialog("Error occured while saving: " + "<br><br>" + data.responseText, {
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

        var sourceCode = editorList.getActiveEditor().getValue();
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
                new $.Zebra_Dialog("Error occured during execution: " + "<br><br>" + data.responseText, {
                    'buttons': false,
                    'modal': false,
                    'position': ['right - 20', 'top + 20'],
                    'auto_close': 1500,
                    'type': 'error',
                    'title': sourceName
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

    //begin loading terminal
    loadTerminal();

    //stop terminal on clicking close
    $('#closeTerminal').click(function(event) {
        stopTerminal();
    });

    //stop terminal on clicking close
    $('#reloadTerminal').click(function(event) {
        reloadTerminal();
    });

});

$(document).on('click', '#minimizeTerminal', function(e){
    //panel collapse in terminal
    var $this = $(this);
	if(!$this.hasClass('panel-collapsed')) {
		$this.parents('.panel').find('.panel-body').slideUp();
		$this.addClass('panel-collapsed');
		$this.find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
	} else {
		$this.parents('.panel').find('.panel-body').slideDown();
		$this.removeClass('panel-collapsed');
		$this.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
	}
});
