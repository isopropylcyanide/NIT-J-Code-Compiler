/*jshint esversion: 6 */
//editor classes for initializing codemirror instances in tabbed panes
editorMap = {
    //mapping indices to editor instances
};

activeIndex = undefined;
uniqueID = 0;
var tabs = $('#tabs');

class allEditors {
    // constructor containing
    constructor() {}
    addEditor(index, CodeMirrorInstance) {
        editorMap[index] = CodeMirrorInstance;
        activeIndex = index;
    }
    getActiveEditor() {
        //for code properties
        return editorMap[activeIndex];
    }
    setActiveEditor(activeInd) {
        //when a tab receives focus
        activeIndex = activeInd;
    }
    removeEditor(removedIndex) {
        //when delete is called
        delete editorMap[removedIndex];
    }
    toString() {
        return Object.keys(editorMap);
    }
}

var editorList = new allEditors();

//add tab button is clicked
$("#add-tab").click(function() {
    $("#tabs ul").append(
        "<li><a href='#tab" + uniqueID + "'> New Tab"+(uniqueID)+" </a><span class=\"ui-icon ui-icon-close\"</li>"
    );
    $("#tabs").append(
        "<div id='tab" + uniqueID + "'>" +
        "<div class=\"form-group\" class=\"text-editor-panel\">" +
        "<textarea class=\"form-control\" id=\"codeEditor" + uniqueID + "\">//Your text goes here</textarea>" +
        "</div></div>"
    );
    //once the base textarea has been added
    var localEditor = CodeMirror.fromTextArea(document.getElementById("codeEditor" + uniqueID), {
        // Create codemirror instance
        lineNumbers: true,
        lineWrapping: true,
        matchBrackets: true,
        mode: "text/x-c++src",
        styleActiveLine: true
    });
    editorList.addEditor(uniqueID, localEditor);
    $('#languageSelect').trigger("change");
    selectTheme();
    $("#tabs").tabs("refresh");
    //select the tab on load
    $("#tabs").tabs("option", "active", uniqueID);
    uniqueID++;
});

// Close icon: removing the tab on click
tabs.on("click", "span.ui-icon-close", function() {
    var numTabs = Object.keys(editorMap).length;
    if (numTabs == 1){
        new $.Zebra_Dialog('Cannot close tab', {
            'buttons': false,
            'modal': false,
            'position': ['right - 20', 'top + 20'],
            'auto_close': 1500,
            'type': 'information',
            'title': 'Last Tab',
        });
        return false;
    }
    var panelId = $(this).closest("li").remove().attr("aria-controls");
    var indexRemoved = panelId.replace('tab', '');
    editorList.removeEditor(indexRemoved);
    // displayOutput('remove: ' + indexRemoved + ' now: ' + editorList.toString() + ' uid: ' + uniqueID+' currentActive: ' + activeIndex);
    $("#" + panelId).remove();
    tabs.tabs("refresh");
});

tabs.tabs({
    activate: function(event, ui) {
        var panelId = ui.newPanel[0].id;
        var curIndex = panelId.replace('tab', '');
        editorList.setActiveEditor(curIndex);
        // displayOutput('act: ' + curIndex + ' now: ' + editorList.toString() + ' uid: ' + uniqueID+' currentActive: ' + activeIndex);
    }
});
