var id = 1;


/*
Script that handles the testcase panel logic
*/

var addTestCase = function() {
    // When a new case is to be added add a new div
    //Also create a new file in /home/user/Testcases directory
    id = id + 1;
    var fileName = 'Testcase' + id;

var myRadioChild = '<div class="funkyradio-success">'+
'                        <input type="radio" name="radio" id="radio' + id + '"/>'+
'                        <label for="radio' + id + '" class="testLabel" id="Testcase' + id + '">Testcase' + id + '</label>'+
'                        <span class="pull-right clickable">'+
'                            <i title="Add" role="button" id="removeCase" class="glyphicon glyphicon-minus-sign text-danger"></i>'+
'                        </span>'+
'                    </div>';


    //create the corresponding file to the user server
    return $.ajax({
        method: 'POST',
        url: "makeRemoteDirectory",
        data: {
            'remote_path': './Testcases/' + fileName,
            'is_file': "True"
        },
        success: function(data) {
            //this gets called when server returns an OK response
            //now remove menu item from tree
            new $.Zebra_Dialog(data, {
                'buttons': false,
                'modal': false,
                'position': ['left + 20', 'top + 20'],
                'auto_close': 500,
                'type': 'confirmation',
                'title': 'Testcase added'
            });
            //on success, append the dom element
            $(".funkyradio").append(myRadioChild);
        },
        error: function(data) {
            new $.Zebra_Dialog("Error occured while creating: " + "<br><br>" + data.responseText, {
                'buttons': false,
                'modal': false,
                'position': ['left + 20', 'top + 20'],
                'auto_close': 1500,
                'type': 'error',
                'title': 'Testcase not added'
            });
        }
    });

};

var removeTestCase = function() {
    //Remove the testcase file from the user directory as well as the dom element
    var curId = $(this).attr('id');

    //extract only the id
    var fileName = 'Testcase' + curId.replace('removeCase', '');

    return $.ajax({
        method: 'POST',
        url: "deleteRemoteDir",
        data: {
            'remote_path': './Testcases/' + fileName
        },
        success: function(data) {
            //this gets called when server returns an OK response
            //now remove menu item from tree
            new $.Zebra_Dialog(data, {
                'buttons': false,
                'modal': false,
                'position': ['left + 20', 'top + 20'],
                'auto_close': 500,
                'type': 'confirmation',
                'title': 'Testcase removed'
            });
            //remove from dom

            $('#' + curId).closest('div').remove();
        },
        error: function(data) {
            new $.Zebra_Dialog("Error occured while deleting: " + "<br><br>" + data.responseText, {
                'buttons': false,
                'modal': false,
                'position': ['left + 20', 'top + 20'],
                'auto_close': 1500,
                'type': 'error',
                'title': 'Testcase removal error'
            });
        }
    });

};


var saveInitialFile = function() {
    //save testcase1 on user's directory. Don't create the dom element as it's already there
    if (id != 1)
        return;
    var fileName = 'Testcase' + id;
    //create the corresponding file to the user server
    return $.ajax({
        method: 'POST',
        url: "makeRemoteDirectory",
        data: {
            'remote_path': './Testcases/' + fileName,
            'is_file': "True"
        },
        success: function(data) {
            //on success, append the dom element
        },
        error: function(data) {
            new $.Zebra_Dialog("Error occured while creating: " + "<br><br>" + data.responseText, {
                'buttons': false,
                'modal': false,
                'position': ['left + 20', 'top + 20'],
                'auto_close': 1500,
                'type': 'error',
                'title': 'Testcase not added'
            });
        }
    });
};


var openTestCase = function(){
    // Opens the selected testcase in a new tab
    var fileName = $(this).attr('id');
    alert('clicked button with id: ' + fileName);
    //open a new tab
    $('#add-tab').trigger("click");
    var path = './Testcases/' + fileName;
    displayFileinEditor(path, fileName);
};

$(document).ready(function() {
    //create first testcase file
    saveInitialFile();

});

$(document).on('click', ".removeCase", removeTestCase);
$(document).on('click', "#addCase", addTestCase);
$(document).on('click', ".testLabel", openTestCase);
