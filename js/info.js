/**
 * Variables for this page
 */
var Attention; 	// Global placeholder for our Attention Class
var Session; 	// Global placeholder for our Session Class

/**
 * The below function will only run
 * after the DOM has been loaded
 */
$( document ).ready(function() {
	Attention = new MyAttention('Modal-Attention');
	Session = new MySessions();
	
	/** Go and get the session status. */
	Session.GetStatus(function(status) {
		if(status.active) {
			/** 
			 * If we have an active session lets hide
			 * the login item and show the home and
			 * logout items. 
			 */
			$('#logout').removeClass('invisible');
		}
		
		/** We are now good to show the page */
		$('body').show();
	});

});