/**
 * Variables for this page
 */
var Attention;	// Global placeholder for the Attention Class
var Session;	// Global placeholder for the Session Class
var Wait;		// Global placeholder for the MySpinner Class

var lastWindowHeight = 0;	// Var to hold the last reported window height
var useableHeight = 0;		// Var to hold the actually usable window height

/**
 * The below function will only run
 * after the DOM has been loaded
 */
$( document ).ready(function() {
	/** Initialize my JS Classes */
	Wait = new MySpinner('MySpinner');
	Attention = new MyAttention('Modal-Attention');
	Session = new MySessions();

	/** Show the spinning wheel */
	Wait.show();
	
	/**
	 * Need to check for an active session
	 */
	Session.GetStatus(function(status) {
		if(!status.active) {
			/** 
			 * There isn't an active session so lets
			 * tell them that and redirect them to the
			 * index page.
			 */
			
			/** Show the main body */
			$('body').show();
			
			/** Hide the spinning wheel */
			Wait.hide();
			
			/** Showing the error */
			Attention.show( 'Your session has expired, please log back in.', {onClose: 'Logout'} );
			return;
		} else {
			/**
			 * They are logged in so we can
			 * now proceed with loading up 
			 * the register.
			 */
			
			/** Turn the Add/Edit into a Pop Up */
			$('#AddUpdate').dialog({
				autoOpen: false
			}); // end of new dialog box

			/** Bind the pull down account menu */
			$('#accountList').on('change', function() {
				/**
				 * If the account is changed we need to reload the register
				 * and updated the "resent/active" account in the db.
				 */
				
				/** Updating the Current Account */
				UpdateCurrentAccount($('#accountList').val());

				/** Reloading the register with the new account info */
				LoadRegister($('#accountList').val());
			});

			/** Bind the window resizing */
			$(window).resize(function() {
				MaintainHeight();
			});
			
			/** Show the main body */
			$('body').show();
			
			/** Trigger a resize event to set the initial height */
			$(window).trigger('resize');
			
			/** Get all the accounts */
			GetAccounts();
			
		}
	});
	
});


/**
 * Function to update the current account in 
 * the Db via an ajax call to php.
 * 
 * @param account_id
 * @returns void
 */
function UpdateCurrentAccount(account_id) {
	
	/** Go and get all the accounts from the db */
	$.ajax({
		url: 'php/register.php',
		type: 'POST',
		cache: 'false',
		data: {
			doWhat: 'updateCurrentAccount',
			account_id: account_id
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

			/** Stop execution */
			return;
		}
	});
}

/**
 * Function to go and get all the accounts
 * from the db, and populate the dropdown list.
 * This will also determine which account to 
 * display first.  
 * 
 * @returns
 */
function GetAccounts() {
	
	/** Go and get all the accounts from the db */
	$.ajax({
		url: 'php/register.php',
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

			/** Stop execution */
			return;
		}
		
		/** Sentinel var for active accounts */
		var activeCount = -1;
		
		/** Else no errors proceed */
		if(json.data.length != 0) {
			/** If there are elements in the return array */
			
			/** Setting sentinal var to zero */
			activeCount = 0;
			
			/** Initially setting the last account to the first return value */
			var last_account_id = json.data[0].account_id;
			
			/** Appending each to the DOM */
			jQuery.each(json.data, function (id, data) {
				if(data.active) {
					/** Increasing the sentinel */
					activeCount++;
				
					/** Load the drop down box */
					$('#accountList').append(
						$('<option>').attr('value', data.account_id).text(data.description)
					);
					
					if(data.current) {
						/** Updating the Current account */
						last_account_id = data.account_id;
					}

				} /** End of data.active */

			}); /** End of jQuery.each */

			/** Checking to see if there were active accounts */
			if(activeCount) {
				/** Selecting the active account from the list */
				$('#accountList').val(last_account_id);
				
				/** Populate the Register */
				LoadRegister(last_account_id);
			}

		} /** End of if there were elements in the data array */
		
		console.log(activeCount);
		
		if(activeCount < 1) {
			/** Creating buttons for dialog box */
			var buttons = {
				"Manage Accounts": function() {
					window.location.href = '../accounts.html';
				},
				"Close": function() { 
					window.location.href = '../';
				}
			};
			
			/** Variable to hold the error message */
			var message = '';

			if(activeCount == -1) {
				message = 'You don\'t have any accounts yet. Please create your frist account under, "Manage Accounts".';
			} else {
				message = 'You don\'t have any active accounts. Please create another account or make an existing one active under, "Manage Accounts".';
			}
			
			/** If there aren't elements in the return array */
			Attention.show( message, {buttons: buttons, onClose: function(){ window.location.href = '../'; } } );
			
			/** Hide the spinning wheel */
			Wait.hide();
			
			/** Stop execution */
			return;
		}

	});

}


/**
 * Function to retrieve all the account
 * entries and display them on the screen.
 * 
 * @param account_id the account_id to retreieve the entries for.
 * @returns
 */
function LoadRegister(account_id) {
	
	/** Calling the payees php via ajax */
	$.ajax({
		url: 'php/register.php',
		type: 'POST',
		cache: 'false',
		data: {
			doWhat: 'getRegister',
			account_id: account_id
		}
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		/** Something odd happend, normally this should never happen. */
		alert('A system error has occurred, please refresh and try again. If this error persists please report it.');
	})
	.done(function(json) {
//		if(json.error) {
//			/** If there was an error, show it. */
//			Attention.show( json.error, {onClose: (json.loggedOut ? 'Logout' : '' )} );
//			return;
//		}
//		
//		/** Else no errors proceed */
//		if(json.data.length == 0) {
//			/** If there aren't elements in the return array */
//			$('#Register > div.mytable').html('None...');
//		} else {
//			/** If there are elements in the return array */
//			
//			/** Appending each to the DOM */
//			jQuery.each(json.data, function (id, data) {
//				$('#Register').append(
//					$('<div>').append(
//						$('<div>').text(data.name),
//						$('<div>').text(data.notes),
//						$('<div>').html(
//							$('<i>').addClass('fa fa-pencil-square-o').on('click', function() { DisplayAddUpdate(data.payee_id); })
//						)
//					)
//				);
//			}); /** End of jQuery.each */
//			
//		} /** End of if there were elements in the data array */

		/** Now showing the Register */
		$('#Register').show();
		
		/** Hide the spinning wheel */
		Wait.hide();
		
	})

}


/**
 * Function to maintain a full height div
 * 
 * @returns void
 */
function MaintainHeight() {
	/** Check to see if the window height has changed */
	if( lastWindowHeight != $(window).height() ) {
		/** If it has we will compute the new useable height for the register. */
		
		/** Storing the last value, and initializing the usable height var */
		lastWindowHeight = $(window).height();
		useableHeight = lastWindowHeight;
		
		/** Removing the height taken up by the the nav bar */
		useableHeight -= $('.nav-bar').outerHeight(true);
		
		/** Removing the padding around the register div */
		useableHeight -= ( $('#Register').outerHeight(true) - $('#Register').height() );
	
		/** Now set the Register DIV to the vailable height */
		$('#Register').height(useableHeight);
		
		/**
		 * Now we need to set the Heights of the internal components
		 * 
		 * The top part with be 2/3 high
		 * The bottom part will be 1/3 high
		 * 
		 */

		/** Removing the padding around the two div */
		useableHeight -= ( $('#RegisterList').outerHeight(true) + $('#RegisterEntry').outerHeight(true) - $('#RegisterList').height() - $('#RegisterEntry').height() );

		/** Set the height of the Register List <div> to 2/3s */
		$('#RegisterList').height(useableHeight * .6665);
		
		/** Set the height of the Register Entry <div> to 1/3s */
		$('#RegisterEntry').height(useableHeight * .3332);
		
	}
}
