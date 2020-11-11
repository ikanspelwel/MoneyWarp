/**
 * Variables for this page
 */
var Attention;	// Global placeholder for our Attention Class
var Session;	// Global placeholder for our Session Class

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
			 * show the login box.
			 */
			$('#loginDiv').show();
		} else {
			/** 
			 * Else they are logged in so lets show
			 * the main home page and the logout button
			 */
			$('#homeDiv').show();
			$('#logout').removeClass('invisible');
		}

		/** Now we can show the main body. */
		$('body').show();
	});
	
	/**
	 * Binding the submit action on the login form
	 * so we can handle it with an ajax/json call.
	 */
	$('#loginForm').on('submit', function() {
		/** Call the fucntion to process the login */
		ProcessLogin();

		/** Return False to stop the normal form processing */
		return false;
	});
	
});


/**
 * Function to process a login.
 * 
 * @returns void
 */
function ProcessLogin() {

	/** Calling the login form via ajax */
	$.ajax({
		url: 'php/login.php',
		type: 'POST',
		cache: 'false',
		data: {
			user_name: $('#user_name').val(),
			password: $('#password').val()
		}
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		/** Something odd happend, normally this should never happen. */
		alert('A system error has occurred, please refresh and try again. If this error persists please report it.');
	})
	.done(function(json) {
		if(json.error) {
			/** If there was an error, show it. */
			Attention.show(json.error);
			return;
		}
		
		/** Else no error proceed */
		if(json.success) {
			/** If the login was successfull we will refresh this page */
			window.location.href = './';
		} else {
			/** Invalid login, so error message */
			Attention.show('Invalid user name or password.');
		}

	})
}