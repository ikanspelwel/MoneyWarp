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
	
	Session.GetStatus(function(status) {
		if(status.active) {
			/** 
			 * We have an active session so lets 
			 * redirect them to the home page.
			 */
			window.location.href = 'home/';
		} /** Else don't do anything */
	});
		
});