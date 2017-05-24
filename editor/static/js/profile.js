var $name = $('#profName');
var $roll = $('#profRoll');
var $email = $('#profEmail');
var $tel = $('#profTel');
var $dob = $('#profDate');
var $pass1 = $('#profPass1');
var $pass2 = $('#profPass2');
var $profAlert = $('#profAlert');
var $profSkill = $('#skillTag');
var $profPic = $('#userImage img');

var resetProfile = function() {
    //resets user profile to his directory
    return $.ajax({
        method: 'POST',
        url: "updateProfile",
        data: {
            'name': '',
            'roll': '',
            'email': '',
            'tel': '',
            'dob': '',
            'skill': '',
            'pass1': $pass1.val(),
            'pass2': $pass2.val()
        },
        success: function(data) {
            //this gets called when server returns an OK response
            //now remove menu item from tree
            $profAlert.text(data);
            getUserProfile();
        },
        error: function(data) {
            $profAlert.text(data.responseText);
        }
    });

};


var saveProfile = function() {
    // Saves user profile to his directory
    $('#saveProfileButton').click(function(event) {
        return $.ajax({
            method: 'POST',
            url: "updateProfile",
            data: {
                'name': $name.val(),
                'roll': $roll.val(),
                'email': $email.val(),
                'tel': $tel.val(),
                'dob': $dob.val(),
                'pass1': $pass1.val(),
                'pass2': $pass2.val(),
                'skill': $profSkill.val(),
                'picture':$profPic.attr('src')
            },
            success: function(data) {
                //this gets called when server returns an OK response
                //now remove menu item from tree
                $profAlert.text(data);
                //clear password fields
                $pass1.val("");
                $pass2.val("");
            },
            error: function(data) {
                $profAlert.text(data.responseText);
            }
        });

    });
};

function getUserProfile() {
    //gets user profile from his directory
    return $.ajax({
        method: 'POST',
        url: "getProfile",
        data: {},
        success: function(data) {
            //this gets called when server returns an OK response
            //now remove menu item from tree
            data = JSON.parse(data);
            $name.val(data.name);
            $roll.val(data.roll);
            $tel.val(data.tel);
            $dob.val(data.dob);
            $email.val(data.email);
            $profSkill.tagsinput('add', data.skill);
            $profPic.attr('src', data.picture);
            $profAlert.text("Profile loaded successfully");
            //clear password fields
            $pass1.val("");
            $pass2.val("");
        },
        error: function(data) {
            $profAlert.text('Error fetching profile: ' + data.responseText);
        }
    });
}

var uploadPic = function(event) {
    // button that browses file and pastes content into editorList.getActiveEditor()
    var preview = document.querySelector('img');
    var file = document.querySelector('input[type=file]').files[0];
    var reader = new FileReader();
    reader.addEventListener("load", function() {
        preview.src = reader.result;
    }, false);

    if (file) {
        reader.readAsDataURL(file);
    }
};

$(document).ready(function() {
    // Load profile data
    getUserProfile();

    $profAlert.bind('DOMNodeInserted', function(event) {
        $profAlert.effect('highlight', {}, 2000);
    });

    $('#uploadPicButton').attr({
        'accept': '.jpg,.jpeg,.png'
    });

});

$(document).on('click', "#saveProfileButton", saveProfile);
$(document).on('click', "#resetProfileButton", resetProfile);
