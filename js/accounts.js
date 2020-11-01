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
			
			/** Populate the list of accounts */
			LoadAccounts();
		}
	});
	
	
	
});


/**
 * Function to go and get the list of accounts
 * and then add them to the DOM and then show 
 * them.
 * 
 * @returns void
 */
function LoadAccounts() {
	
	/** Calling the accounts php via ajax */
	$.ajax({
		url: 'php/accounts.php',
		type: 'POST',
		cache: 'false',
		data: {
			doWhat: 'getAccounts'
		}
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		/** Something odd happend, normally this should never happen. */
		alert('A system error has occurred, please refresh and try again. If this error persists please report it.');
	})
	.done(function(json) {
		if(json.error) {
			/** If there was an error, show it. */
			Attention.show( json.error, {onClose: (json.loggedOut ? 'Logout' : '' )} );
			return;
		}
		
		/** Else no errors proceed */
		if(json.data.length == 0) {
			/** If there aren't elements in the return array */
			$('#AccountList > div.mytable').html('None...');
		} else {
			/** If there are elements in the return array */
			
			/** Appending each to the DOM */
			jQuery.each(json.data, function (id, data) {
				$('#list').append(
					$('<div>').append(
						$('<div>').text(data.description),
						$('<div>').text(data.type),
						$('<div>').text(data.account_num),
						$('<div>').text(data.aba),
						$('<div>').addClass('text-center').html(
							$('<i>').addClass('fa').addClass(
								(data.active ? 'fa-check-square-o' : 'fa-times-circle')
							)
						),
						$('<div>').html($('<i>').addClass('fa fa-pencil-square-o'))
					)
				);
			}); /** End of jQuery.each */
			
		} /** End of if there were elements in the data array */

		/**
		 * Now showing the list of accounts...
		 */
		$('#AccountList').show();
		
	})

}
