function displayOutput(data) {
    //display output
    document.getElementById('stdoutput').style.display = "inline-block";
    document.getElementById('stdoutput').value = data;
}

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
    var input = document.getElementById("selectTheme");
    var theme = input.options[input.selectedIndex].textContent;
    editor.setOption("theme", theme);
  }

$(document).ready(function() {

    //Fire onchange event automatically
    $('#languageSelect').trigger("change");

    //Allow only certain file extensions
    $('#fileButton').attr({
        'accept': '.c,.cpp,.java,.py'
    });

    //file-tree

    // button that browses file and pastes content into editor
    $('fileButton').click(function(event) {
        console.log("fired baba");
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
        document.getElementById("languageSelect").onchange();
    });

    //toggle stdin response windows
    $('#stdinButton').click(function() {
        // $('#stdinput').toggle('fast');
        $('textarea#stdinput').html('');
    });

    //jquery that compiles code at the server by sending UI Data and outputting the response
    $('#executeButton').click(function() {
        var sourceCode = editor.getValue();
        var sourceLang = document.getElementById("languageSelect").value;
        var sourceInp = document.getElementById("stdinput").value;
        var sourceName = document.getElementById("fname").value;
        if (sourceName == ""){
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
                alert("Error occured during submission. Try again later");
            }
        });

    });
});
