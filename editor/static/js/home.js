/*jshint esversion: 6 */

function setupUserProfile(){
    //loads details about user and the corresponding accordion
    var Accordion = function(el, multiple) {
		this.el = el || {};
		this.multiple = multiple || false;

		// Variables privadas
		var links = this.el.find('.link');
		// Evento
		links.on('click', {el: this.el, multiple: this.multiple}, this.dropdown);
	};

	Accordion.prototype.dropdown = function(e) {
		var $el = e.data.el,
			$this = $(this),
			$next = $this.next();

		$next.slideToggle();
		$this.parent().toggleClass('open');

		if (!e.data.multiple) {
			$el.find('.submenu').not($next).slideUp().parent().removeClass('open');
		}
	};

	var accordion = new Accordion($('#accordion'), false);
}

function load_filemanager() {
     document.getElementById("filemanager").innerHTML='<object type="text/html" data="filemanager" ></object>';
}


function getUserProfile(){
    //gets user profile from his directory
    return $.ajax({
        method: 'POST',
        url: "getProfile",
        data: {},
        success: function(data) {
            //this gets called when server returns an OK response
            //now remove menu item from tree
            data = JSON.parse(data);
            $('#homeName').text(data.name);
            $('#homeRoll').text(data.roll);
            $('#homeTel').text(data.tel);
            $('#homeDob').text(data.dob);
            $('#homeEmail').text(data.email);
            $('#homePicture').attr('src',data.picture);
            data.skill.split(',').forEach(function(skill){
                    //add skill tag for each
                    var cmd = '<span class="tags">'+skill+'</span>';
                    $('#homeSkill').append(cmd);
            });
        },
        error: function(data) {

        }
    });
}

$(function() {


    //load user profile pane
    setupUserProfile();

    //fetch user profile
    getUserProfile();
});
