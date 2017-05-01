/*jshint esversion: 6 */
editorMap = {
    //mapping indices to editor instances
};
editorLang = {
    //mapping indices to editor instances
};
editorFname = {
    //mapping indices to filenames
};
editorIsTestcase = {
    //check whether editor instance is a testcase in which
    // ./TestCases is added on clicking save Button
};

activeIndex = undefined;
uniqueID = 0;
var tabs = $('#tabs');
var $langSelect = $('#languageSelect');


class allEditors {
    //editor classes for initializing codemirror instances in tabbed panes
    addEditor(index, CodeMirrorInstance) {
        activeIndex = index;
        editorMap[index] = CodeMirrorInstance;
        editorLang[index] = getLanguageMode();
        //set active language as the one selected
        let curLang = $("#languageSelect option:selected").text();
        this.setActiveEditorLang(curLang);
    }
    getActiveEditor() {
        //for code properties
        return editorMap[activeIndex];
    }
    setActiveEditor(activeInd) {
        //when a tab receives focus
        activeIndex = activeInd;
    }

    setEditorisTestCase(index){
        //set an editor instance to be a testcase
        editorIsTestcase[index] = true;
    }

    getEditorisTestCase(){
        //return true if current editor is a testcase
        return editorIsTestcase[activeIndex];
    }

    setActiveEditorLang(lang){
        //set language mode of current active editor
        editorLang[activeIndex] = lang;
        editorMap[activeIndex].setOption("mode", getLanguageMode(lang));
        // displayOutput(' now: ' + editorList.toString() + ' uid: ' + uniqueID+' currentActive: ' + activeIndex + ' lang: ' + editorList.getActiveEditorLang() );
    }

    getActiveEditorLang(){
        //get language mode of current active editor
        return editorLang[activeIndex];
    }
    setActiveEditorFname(fname){
        //set fname of current active editor
        editorFname[activeIndex] = fname;
    }
    getActiveEditorFname(){
        //set fname of current active editor
        return editorFname[activeIndex];
    }

    removeEditor(removedIndex) {
        //when delete is called
        delete editorMap[removedIndex];
        delete editorLang[removedIndex];
    }
    toString() {
        return Object.keys(editorMap);
    }
}

var editorList = new allEditors();

//add tab button is clicked
$("#add-tab").bind("click",function(event, isTestCase="false") {
    $("#tabs ul").append(
        "<li><a href='#tab" + uniqueID + "'> New Tab"+(uniqueID)+" </a><span class=\"ui-icon ui-icon-close\"</li>"
    );
    $("#tabs").append(
        "<div id='tab" + uniqueID + "'>" +
        "<div class=\"form-group\" class=\"text-editor-panel\">" +
        "<textarea class=\"form-control\" id=\"codeEditor" + uniqueID + "\"></textarea>" +
        "</div></div>"
    );
    //once the base textarea has been added
    let localEditor = CodeMirror.fromTextArea(document.getElementById("codeEditor" + uniqueID), {
        // Create codemirror instance
        lineNumbers: true,
        lineWrapping: true,
        matchBrackets: true,
        mode: "text/x-c++src",
        styleActiveLine: true
    });
    editorList.addEditor(uniqueID, localEditor);
    if (isTestCase === "true")
        editorList.setEditorisTestCase(uniqueID);

    selectRandomEditorTheme();
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
    // displayOutput('remove: ' + indexRemoved + ' now: ' + editorList.toString() + ' uid: ' + uniqueID+' currentActive: ' + activeIndex + ' whose lang: ' + editorList.getActiveEditorLang());
    $("#" + panelId).remove();
    tabs.tabs("refresh");
});

tabs.tabs({
    activate: function(event, ui) {

        // if (editorList.getEditorisTestCase()){
        //     alert('testcase tab : save accordingly');
        // }

        var panelId = ui.newPanel[0].id;
        var curIndex = panelId.replace('tab', '');
        editorList.setActiveEditor(curIndex);
    //     displayOutput('act: ' + curIndex + ' now: ' + editorList.toString() + ' uid: ' + uniqueID+' currentActive: ' + activeIndex + ' lang: ' + editorList.getActiveEditorLang()  + ' fname: '+ editorList.getActiveEditorFname() +
    // " isTest: " + editorList.getEditorisTestCase());
        //also set the current language as the one here
        document.getElementById('fname').value = editorList.getActiveEditorFname();

        let langVal = $('#languageSelect option').filter(function () { return $(this).html() == editorList.getActiveEditorLang(); }).val();
        $('#languageSelect').val(langVal).trigger('change');
    }
});
