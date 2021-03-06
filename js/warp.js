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

	/**
	 * Need to check for an active session
	 */
	Session.GetStatus(function(status) {
		if(!status.active) {
			/** 
			 * We don't have an active session so lets 
			 * redirect them to the index page.
			 */
			window.location.href = './';
		} else {
			/**
			 * They are logged in so we can
			 * now show the main body.
			 */
			$('body').show();
		}
	});
	
});
