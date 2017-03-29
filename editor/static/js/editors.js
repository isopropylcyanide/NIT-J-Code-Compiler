/*jshint esversion: 6 */
//editor classes for initializing codemirror instances in tabbed panes
editorMap = {
    //mapping indices to editor instances
};

activeIndex = undefined;

class allEditors{
    // constructor containing
    constructor(){
    }
    addEditor(index, CodeMirrorInstance){
        editorMap[index] = CodeMirrorInstance;
        activeIndex = index;
    }
    getActiveEditor(){
        //for code properties
        return editorMap[activeIndex];
    }
    setActiveEditor(activeIndex){
        //when a tab receives focus
        activeIndex = activeIndex;
    }
    removeEditor(removedIndex){
        //when delete is called
        delete editorMap[removedIndex];
    }
    toString(){
        return Object.keys(editorMap);
    }
}

var editorList = new allEditors();

//add tab button is clicked
$("#add-tab").click(function() {
    var num_tabs = $("#tabs ul li").length + 1;
    $("#tabs ul").append(
        "<li><a href='#tab" + num_tabs + "'> New Tab </a></li>"
    );
    $("#tabs").append(
        "<div id='tab" + num_tabs + "'>"+
        "<div class=\"form-group\" class=\"text-editor-panel\">"+
        "<textarea class=\"form-control\" id=\"codeEditor" + num_tabs + "\">//Your text goes here</textarea>"+
        "</div></div>"
    );
    //once the base textarea has been added
    var localEditor = CodeMirror.fromTextArea(document.getElementById("codeEditor"+ num_tabs), {
        // Create codemirror instance
        lineNumbers: true,
        lineWrapping: true,
        matchBrackets: true,
        mode: "text/x-c++src",
        styleActiveLine: true
    });
    editorList.addEditor(num_tabs, localEditor);
    $('#languageSelect').trigger("change");
    selectTheme();
    $("#tabs").tabs("refresh");
});
