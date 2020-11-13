/**
 * Variables for this page
 */
var Attention;	// Global placeholder for the Attention Class
var Session;	// Global placeholder for the Session Class
var Wait;		// Global placeholder for the MySpinner Class

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
				DisplayAddUpdate();
			});
			
			/** Show the main body */
			$('body').show();
			
			/** Populate the list of payees */
			ShowList();
		}
	});
	
});



/**
 * Function to go and get the list of payees
 * and then add them to the DOM and then show 
 * them.
 * 
 * @returns void
 */
function ShowList() {
	
	/** Calling the payees php via ajax */
	$.ajax({
		url: 'php/payees.php',
		type: 'POST',
		cache: 'false',
		data: {
			doWhat: 'getList'
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
			$('#List > div.mytable').text('None...');
			
			/** Showing a hint if there are no existing accounts */
			$('#List > div.mytable').append(
				$('<span>').addClass('float-right').text('add payees here').append(
					$('<i>').addClass('add-here fa fa-arrow-up fa-2x')
				)
			);

		} else {
			/** If there are elements in the return array */
			
			/** Appending each to the DOM */
			jQuery.each(json.data, function (id, data) {
				$('#list').append(
					$('<div>').append(
						$('<div>').text(data.name),
						$('<div>').text(data.notes),
						$('<div>').html(
							$('<i>').addClass('fa fa-pencil-square-o').on('click', function() { DisplayAddUpdate(data.payee_id); })
						)
					)
				);
			}); /** End of jQuery.each */
			
		} /** End of if there were elements in the data array */

		/** Now showing the list of payees...	 */
		$('#List').show();
		
		/** Hide the spinning wheel */
		Wait.hide();
		
	})
}

/**
 * Function to display the payee Add or Edit
 * window. This function will will open up a new
 * popup window and either populate it with the
 * info provided via the payee_id or it will
 * just present a empty form to fill out.
 * 
 * @param payee_id
 * @returns void
 */
function DisplayAddUpdate(payee_id) {
	/** Checking to see if the acount_id was provided or not */
	if(payee_id === undefined) {
		/** 
		 * New Payee. Will clear the fields set the title
		 * and show the dialog box.
		 */

		/** Reset all the fields */
		$('#name').val('');
		$('#notes').val('');
		
		/** Set the dialog box title */
		$('#AddUpdate').dialog( "option", "title", "Add Payee" );
		
		/** Set the dialog buttons */
		$('#AddUpdate').dialog( "option", "buttons", {
			"Add": function() { DoAddUpdate(); },
			"Cancel": function() { $(this).dialog('close'); }
		});
		
		/** Now show the Dialog Box */
		$('#AddUpdate').dialog('open');
		
	} else {
		/**
		 *  Existing payee, we get the payee deatils
		 *  from the db and then preform and update. 
		 */
		
		/** Show the spinning wheel */
		Wait.show();

		/** Calling the payees php via ajax */
		$.ajax({
			url: 'php/payees.php',
			type: 'POST',
			cache: 'false',
			data: {
				doWhat: 'getItem',
				payee_id: payee_id
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
				Attention.show( 'That payee couldn\'t be found. Please refresh and try again.' );
				return;
			} else {
				/** If there are elements in the return array */

				/** Fill in the returned Values */
				$('#name').val(json.data.name);
				$('#notes').val(json.data.notes);

				/** Set the dialog box title */
				$('#AddUpdate').dialog( "option", "title", "Update Payee" );
				
				/** Set the dialog buttons */
				$('#AddUpdate').dialog( "option", "buttons", {
					"Update": function() { DoAddUpdate(payee_id) },
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
 * @param payee_id
 * @returns void
 */
function DoAddUpdate(payee_id) {
	
	/** Calling the payees php via ajax */
	$.ajax({
		url: 'php/payees.php',
		type: 'POST',
		cache: 'false',
		data: {
			doWhat: 'addUpdate',
			payee_id: payee_id,
			name: $('#name').val(),
			notes: $('#notes').val()
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
			Attention.show( 'That payee couldn\'t be found. Please refresh and try again.' );
			return;
		} else {
			/** Add/Update was successful, refresh page */
			
			location.reload();
			
		} /** End of if there were elements in the data array */

		/** Hide the spinning wheel */
		Wait.hide();
		
	}); /** End of ajax "done" */
	
}
