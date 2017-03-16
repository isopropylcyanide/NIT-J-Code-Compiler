$(document).ready(function () {

    //toggle stdin response windows
    $('#Stdin').click(function () {
        $('#stdinput').toggle('fast');
        $('textarea#stdinput').html('');
    });

    //jquery that compiles code at the server by sending UI Data and outputting the response
    $('#execute').click(function () {
        console.log("mujhe ");
        var sourceCode = editor.getValue();
        var sourceLang = document.getElementById("languageSelect").value;
        var sourceInp = document.getElementById("stdinput").value;
        var sourceName = document.getElementById("fname").value;
        if (sourceName == "") {
            console.log("empty source");
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
            success: function (data) {
                //this gets called when server returns an OK response
                displayOutput(data);
            },
            error: function (data) {
                alert("Error occured during submission. Try again later");
            }
        });

    });
});
