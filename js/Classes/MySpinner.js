/**
 * When we initialize an instance of this class
 * add the appropriate DOM object to the DOM 
 * for dispalying the waiting box.
 */
function MySpinner(name) {
	/** Storing the ID name for this class */
	this.name = name;
	
	/**
	 * Need to create the DOM objects that will display
	 * this spinner.
	 */
	$(document.body).append(
		$('<div>').attr('id', this.name).addClass("ui-overlay my-spinner myHidden").append(
			$('<div>').addClass('ui-widget-overlay'),
			$('<div>').attr('id', this.name).addClass('ui-widget-shadow ui-corner-all spinner-background'),
			$('<div>').addClass('ui-widget ui-widget-content ui-corner-all spinner-background').append(
				$('<img>').addClass('spinner-logo').attr('src', '../../images/loaderA64.gif').attr('alt', 'Loading...')
			)
		)
	);

}

/**
 * This function will show the spinner
 */
MySpinner.prototype.show = function () {
	/** Geting the Window Height and Width */
	var Height = $(window).height();
	var Width = $(window).width();
	
	/** Centering the Waiting Icon */
	var thisHeight = Height / 3 - 43;
	$('.spinner-background').attr('style', 'left: '+ (Width / 2 - 43)  +'px; top: '+ (thisHeight < 0 ? 0 : thisHeight) +'px;');

	/** Preventing Scrolling */ 
	$('html, body').css({
	    'overflow': 'hidden',
	    'height': '100%'
	});
	
	/** Show it spinner */
	$('#'+ this.name).show('fast');
}

/**
 * This function will hide the spinner
 */
MySpinner.prototype.hide = function () {
	/** Actually Hide it */
	$('#'+ this.name).hide('slow');
	
	/** Restoring Scrolling */
	$('html, body').css({
	    'overflow': 'auto'
	});
}