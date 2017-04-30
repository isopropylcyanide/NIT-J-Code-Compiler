$(document).ready(function() {

    $('#addCase').click(function(event) {
        var numElements = $(".funkyradio div").length;
        var id = numElements + 1;
        var myRadioChild = '<div class="funkyradio-success">' +
            '                        <input type="radio" name="radio" id="radio'+id+'"/>' +
            '                        <label for="radio'+id+'">Testcase'+id+'</label>' +
            '                        <span class="pull-right clickable">' +
            '                            <i title="Delete" role="button" id="removeCase'+id+'" class="glyphicon glyphicon-minus-sign removeCase"></i>' +
            '                        </span>' +
            '                    </div>';


        $(".funkyradio").append(myRadioChild);

    });

});
