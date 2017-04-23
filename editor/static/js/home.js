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

$(function() {

    //load user profile pane
    setupUserProfile();

    //load file manager
    load_filemanager();
});
