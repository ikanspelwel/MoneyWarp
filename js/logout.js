/**
 * Variables for this page
 */
var Session;	// Global placeholder for our Session Class

/**
 * The below function will only run
 * after the DOM has been loaded
 */
$( document ).ready(function() {
	Session = new MySessions();
	
	/**
	 * Need to Log out the session
	 */
	Session.LogOut();

});