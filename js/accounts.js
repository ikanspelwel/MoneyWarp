/**
 * Variables for this page
 */
var Attention; 	// Global placeholder for the Attention Class
var Session; 	// Global placeholder for the Session Class
var Wait; 		// Global placeholder for the MySpinner Class

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
			 * now show the main body.
			 */
			
			/** Turn the Add/Edit into a Pop Up */
			$('#AddUpdate').dialog({
				autoOpen: false
			}); // end of new dialog box

			
			/** Bind the Add icon */
			$('#List .fa-plus-circle').on('click', function() {
				DisplayAddEdit();
			});
			
			/** Show the main body */
			$('body').show();
			
			/** Populate the list of accounts */
			ShowAccounts();
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
function ShowAccounts() {
	
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
			$('#List > div.mytable').html('None...');
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
								(data.active ? 'fa-check-circle' : 'fa-times-circle')
							)
						),
						$('<div>').html(
							$('<i>').addClass('fa fa-pencil-square-o').on('click', function() { DisplayAddEdit(data.account_id); })
						)
					)
				);
			}); /** End of jQuery.each */
			
		} /** End of if there were elements in the data array */

		/** Now showing the list of accounts...	 */
		$('#List').show();
		
		/** Hide the spinning wheel */
		Wait.hide();
		
	})
}

/**
 * Function to display the account Add or Edit
 * window. This function will will open up a new
 * popup window and either populate it with the
 * info provided via the account_id or it will
 * just present a empty form to fill out.
 * 
 * @param account_id
 * @returns void
 */
function DisplayAddEdit(account_id) {
	/** Checking to see if the acount_id was provided or not */
	if(account_id === undefined) {
		/** 
		 * New Account. Will clear the fields set the title
		 * and show the dialog box.
		 */

		/** Reset all the fields */
		$('#description').val('');
		$('#type').val('0');
		$('#account_num').val('');
		$('#aba').val('');
		$('#active').val('1');
		
		/** Set the dialog box title */
		$('#AddUpdate').dialog( "option", "title", "Add Account" );
		
		/** Set the dialog buttons */
		$('#AddUpdate').dialog( "option", "buttons", {
			"Add": function() { DoAddUpdate(); },
			"Cancel": function() { $(this).dialog('close'); }
		});
		
		/** Now show the Dialog Box */
		$('#AddUpdate').dialog('open');
		
	} else {
		/**
		 *  Existing account, we get the account deatils
		 *  from the db and then preform and update. 
		 */
		
		/** Show the spinning wheel */
		Wait.show();

		/** Calling the accounts php via ajax */
		$.ajax({
			url: 'php/accounts.php',
			type: 'POST',
			cache: 'false',
			data: {
				doWhat: 'getAccount',
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
				return;
			}
			
			/** Else no errors proceed */
			if(json.data == null) {
				/** If there aren't elements in the return array */
				Attention.show( 'That account couldn\'t be found. Please refresh and try again.' );
				return;
			} else {
				/** If there are elements in the return array */

				/** Fill in the returned Values */
				$('#description').val(json.data.description);
				$('#type').val(json.data.type);
				$('#account_num').val(json.data.account_num);
				$('#aba').val(json.data.aba);
				$('#active').val(json.data.active);

				/** Set the dialog box title */
				$('#AddUpdate').dialog( "option", "title", "Update Account" );
				
				/** Set the dialog buttons */
				$('#AddUpdate').dialog( "option", "buttons", {
					"Update": function() { DoAddUpdate(account_id) },
					"Cancel": function() { $(this).dialog('close'); }
				});

				/** Now show the Dialog Box */
				$('#AddUpdate').dialog('open');
				
			} /** End of if there were elements in the data array */

			/** Hide the spinning wheel */
			Wait.hide();
			
		}); /** End of ajax ".done()" */
		
	}
}


/**
 * Function to actually process the add or update. 
 * This will call the PHP handler, via ajax to
 * preform the heavy listing and Db interaction
 *  
 * @param account_id
 * @returns void
 */
function DoAddUpdate(account_id) {
	
	/** Calling the accounts php via ajax */
	$.ajax({
		url: 'php/accounts.php',
		type: 'POST',
		cache: 'false',
		data: {
			doWhat: 'addUpdate',
			account_id: account_id,
			description: $('#description').val(),
			type: $('#type').val(),
			account_num: $('#account_num').val(),
			aba: $('#aba').val(),
			active: $('#active').val()
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
		if(json.data == null) {
			/** If there aren't elements in the return array */
			Attention.show( 'That account couldn\'t be found. Please refresh and try again.' );
			return;
		} else {
			/** Add/Update was successful, refresh page */
			
			location.reload();
			
		} /** End of if there were elements in the data array */

		/** Hide the spinning wheel */
		Wait.hide();
		
	}); /** End of ajax "done" */
	
}