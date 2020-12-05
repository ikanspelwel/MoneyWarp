/**
 * Variables for this page
 */
var Attention;	// Global placeholder for the Attention Class
var Session;	// Global placeholder for the Session Class
var Wait;		// Global placeholder for the MySpinner Class

var lastWindowHeight = 0;	// Var to hold the last reported window height
var lastWindowWidth = 0;	// Var to hold the last reported window width
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
			 * the register stuff.
			 */
			
			/** Turn the Add/Edit into a Pop Up */
			$('#AddPayee').dialog({
				autoOpen: false,
				title: 'Add Payee',
				buttons: {
					"Add": function() { AddPayee(); },
					"Cancel": function() { $(this).dialog('close'); }
				}
			}); // end of new dialog box

			$('#AddCategory').dialog({
				autoOpen: false,
				title: 'Add Category',
				buttons: {
					"Add": function() { AddCategory(); },
					"Cancel": function() { $(this).dialog('close'); }
				}
			}); // end of new dialog box

			/** Turn the Date field into a DatePicker */
			$( "#date" ).datepicker({dateFormat: 'M d, yy'});
			$( "#date" ).datepicker('setDate', new Date());

			/** Bind the pull down account menu */
			$('#account_id').on('change', function() {
				/**
				 * If the account is changed we need to reload the register
				 * and updated the "resent/active" account in the db.
				 */
				
				/** Show the spinning wheel */
				Wait.show();

				/** Updating the Current Account */
				UpdateCurrentAccount($('#account_id').val());

				/** Reloading the register with the new account info */
				LoadRegister($('#account_id').val());
			});

			/** Bind the pull down payee box */
			$('#payee_id').on('change', function() {
				if($('#payee_id').val() == 0) {
					$('#payee_id').val(-1);
					$('#payee_name').val('');
					$('#payee_notes').val('');
					$('#AddPayee').dialog('open');
				}
			});
			
			/** Bind the pull down category box */
			$('#category_id').on('change', function() {
				if($('#category_id').val() == 0) {
					$('#category_id').val(-1);
					$('#category_name').val('');
					$('#category_notes').val('');
					$('#AddCategory').dialog('open');
				}
			});
			
			/** Bind the register cancel button */
			$('#cancelRegisterItem').on('click', function() {
				/** Show the spinning wheel */
				Wait.show();
				
				/** Reset the Form */
				SetRegisterForm(function(){
					/** After SetRegisterForm runs successfully, these items will run */
					
					/** Once done, hide the waiting icon */
					Wait.hide();
				});
			});

			/** Bind the register entry button */
			$('#addRegisterItem').on('click', function() {
				AddUpdateRegisterEntry($(this).data('account_entries_id'));
			});

			/** Bind the window resizing */
			$(window).resize(function() {
				MaintainHeight();
				MaintainWidths();
			});
			
			/** Show the main body */
			$('body').show();

			/** Get all the entry form fields */
			SetRegisterForm(function(){
				/** After SetRegisterForm runs successfully, these items will run */

				/** Get all the accounts */
				GetAccounts();
			});
			
		}
	});
	
});


/**
 * Function to add a new category
 * 
 * @returns void
 */
function AddCategory() {
	/** Show the spinning wheel */
	Wait.show();
	
	/** Calling the categories php via ajax */
	$.ajax({
		url: 'php/categories.php',
		type: 'POST',
		cache: 'false',
		data: {
			doWhat: 'addUpdate',
			name: $('#category_name').val(),
			notes: $('#category_notes').val()
		}
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		/** Something odd happend, normally this should never happen. */
		alert('A system error has occurred, please refresh and try again. If this error persists please report it.');
	})
	.done(function(json) {
		/** Hide the spinning wheel */
		Wait.hide();

		if(json.error) {
			/** If there was an error, show it. */
			Attention.show( json.error, {onClose: (json.loggedOut ? 'Logout' : '' )} );
		} else {
			$('#AddCategory').dialog('close');
		}
		
	}); /** End of ajax "done" */

}

/**
 * Function to add a payee
 * 
 * @returns void
 */
function AddPayee() {
	/** Show the spinning wheel */
	Wait.show();
	
	/** Calling the payees php via ajax */
	$.ajax({
		url: 'php/payees.php',
		type: 'POST',
		cache: 'false',
		data: {
			doWhat: 'addUpdate',
			name: $('#payee_name').val(),
			notes: $('#payee_notes').val()
		}
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		/** Something odd happend, normally this should never happen. */
		alert('A system error has occurred, please refresh and try again. If this error persists please report it.');
	})
	.done(function(json) {
		/** Hide the spinning wheel */
		Wait.hide();

		if(json.error) {
			/** If there was an error, show it. */
			Attention.show( json.error, {onClose: (json.loggedOut ? 'Logout' : '' )} );
		} else {
			$('#AddPayee').dialog('close');
		}
		
	}); /** End of ajax "done" */

}


/**
 * Function to process adding an entry to the register.
 * 
 * @returns void
 */
function AddUpdateRegisterEntry(account_entries_id) {
	/** Show the spinning wheel */
	Wait.show();

	/** Call php to add register entry */
	$.ajax({
		url: 'php/register.php',
		type: 'POST',
		cache: 'false',
		data: {
			doWhat: 'addUpdateRegisterEntry',
			account_entries_id: account_entries_id,
			account_id: $('#account_id').val(),
			amount: $('#amount').val(),
			date: $.datepicker.formatDate('yy-mm-dd', $( "#date" ).datepicker('getDate')),
			type: $('#type').val(),
			check_num: $('#check_num').val(),
			payee_id: $('#payee_id').val(),
			category_id: $('#category_id').val(),
			memo: $('#memo').val()
		}
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		/** Hide the spinning wheel */
		Wait.hide();

		/** Something odd happend, normally this should never happen. */
		alert('A system error has occurred, please refresh and try again. If this error persists please report it.');
	})
	.done(function(json) {
		/** Hide the spinning wheel */
		Wait.hide();

		if(json.error) {
			/** If there was an error, show it. */
			Attention.show( json.error, {onClose: (json.loggedOut ? 'Logout' : '' )} );

		} else {
			/** If there was no errors, Show success message */
			Attention.show('Entry added/updated successfully.', {type: 'info', onClose: function(){
				/** Show the spinning wheel */
				Wait.show();
				
				/** Reset the register entry form */
				SetRegisterForm(function(){
					/** After SetRegisterForm runs successfully, these items will run */
					
					/** Reload the Register */
					LoadRegister($('#account_id').val());
				});
			}});
			
			
		}
	});

}

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
		/** Hide the spinning wheel */
		Wait.hide();

		/** Something odd happend, normally this should never happen. */
		alert('A system error has occurred, please refresh and try again. If this error persists please report it.');
	})
	.done(function(json) {
		/** Hide the spinning wheel */
		Wait.hide();

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
 * @param callback funtion to run if provided after success
 * @returns
 */
function GetAccounts(callback) {
	
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
		/** Hide the spinning wheel */
		Wait.hide();

		/** Something odd happend, normally this should never happen. */
		alert('A system error has occurred, please refresh and try again. If this error persists please report it.');
	})
	.done(function(json) {
		if(json.error) {
			/** Hide the spinning wheel */
			Wait.hide();

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
					$('#account_id').append(
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
				$('#account_id').val(last_account_id);
				
				/** Populate the Register */
				LoadRegister(last_account_id);
			}

		} /** End of if there were elements in the data array */

		/** Checking to see if there are accounts to use */
		if(activeCount < 1) {
			/** If there are not any acctive accounts tell the user this */
			
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

			/**
			 * Depending on the value of activeCount they either
			 * have no accounts at all, or they just don't have any
			 * active accounts. So to be more friendly we will tailor
			 * the error message accordingly.
			 */ 
			if(activeCount == -1) {
				message = 'You don\'t have any accounts yet. Please create your frist account under, "Manage Accounts".';
			} else {
				message = 'You don\'t have any active accounts. Please create another account or make an existing one active under, "Manage Accounts".';
			}
			
			/** Showing the tailored error message */
			Attention.show( message, {buttons: buttons, onClose: function(){ window.location.href = '../'; } } );
			
			/** Hide the spinning wheel */
			Wait.hide();
			
			/** Stop execution */
			return;
		} else { /** End of if(activeCount < 1) */
			/** There were no errors and at least one active account was found */
			
			/** Checking to see if a callback function was provided */
			if(typeof callback === "function") {
				/** If it was and it is a function run it */
				callback();
			}
		}

	});

}


/**
 * Function to load the drop down boxes for the
 * register entry form and reset all values.
 * 
 * @param callback funtion to run if provided after success
 * @returns
 */
function SetRegisterForm(callback) {
	
	/** Calling the payees php via ajax */
	$.ajax({
		url: 'php/register.php',
		type: 'POST',
		cache: 'false',
		data: {
			doWhat: 'getRegisterFormItems'
		}
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		/** Hide the spinning wheel */
		Wait.hide();

		/** Something odd happend, normally this should never happen. */
		alert('A system error has occurred, please refresh and try again. If this error persists please report it.');
	})
	.done(function(json) {
		if(json.error) {
			/** Hide the spinning wheel */
			Wait.hide();

			/** If there was an error, show it. */
			Attention.show( json.error, {onClose: (json.loggedOut ? 'Logout' : '' )} );
			
			/** Stoping any further execution */
			return;
		}
		
		/** Reset all the fields */
		$('#payee_id').html('');
		$('#category_id').html('');
		$('#type').val('0');
		$('#memo').val('');
		$('#amount').val('');
		$('#check_num').val('');
		$( "#date" ).datepicker('setDate', new Date());
		$('#addRegisterItem').text('Enter').data('account_entries_id', null)

		/** Adding the Defaults */
		$('#payee_id').append(
			$('<option>').attr('value', -1).text('-- Please Select --'),
			$('<option>').attr('value', 0).text('{ add New }')
		);

		/** Adding the Defaults */
		$('#category_id').append(
			$('<option>').attr('value', -1).text('-- Please Select --'),
			$('<option>').attr('value', 0).text('{ add New }')
		);

		/** Populating the pull downs with the returned data */
		jQuery.each(json.data.payees, function (id, data) {
			$('#payee_id').append(
				$('<option>').attr('value', data.payee_id).text(data.name)
			);
		});
		

		/** Populating the pull downs with the returned data */
		jQuery.each(json.data.categories, function (id, data) {
			$('#category_id').append(
				$('<option>').attr('value', data.category_id).text(data.name)
			);
		});

		/** Checking to see if a callback function was provided */
		if(typeof callback === "function") {
			/** If it was and it is a function run it */
			callback();
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
	
	/** Reset the List */
	$('#list > div').not(':first').remove();
	
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
		/** Hide the spinning wheel */
		Wait.hide();

		/** Something odd happend, normally this should never happen. */
		alert('A system error has occurred, please refresh and try again. If this error persists please report it.');
	})
	.done(function(json) {
		if(json.error) {
			/** Hide the spinning wheel */
			Wait.hide();

			/** If there was an error, show it. */
			Attention.show( json.error, {onClose: (json.loggedOut ? 'Logout' : '' )} );
			return;
		}
		
		/** Else no errors proceed */
		if(json.data.length == 0) {
			/** If there aren't elements in the return array */
			$('#list').append(
					$('<div>').append(
						$('<div>').text('None...'),
						$('<div>').text(''),
						$('<div>').text('').addClass('register-payee'),
						$('<div>').text(''),
						$('<div>').text('')
					)
				);

		} else {
			/** If there are elements in the return array */
			
			/** Appending each to the DOM */
			jQuery.each(json.data, function (id, data) {
				$('#list').append(
					$('<div>').append(
						$('<div>').text(data.check_num),
						$('<div>').text(data.displayDate),
						$('<div>').text(data.name).addClass('register-payee'),
						$('<div>').text(data.amount),
						$('<div>').text(data.balance)
					).on("dblclick", function() { EditRegisterEntry(data); })
				);
			}); /** End of jQuery.each */

		} /** End of if there were elements in the data array */

		/** Now showing the Register */
		$('#Register').show(function(){
			/** Trigger a resize event to set the initial height */
			$(window).trigger('resize');

			/** Now scrolling to the end of the list, which is the most recent entries */
			$("#registerListContainer").scrollTop(function() { return this.scrollHeight; });
		});

		/** Hide the spinning wheel */
		Wait.hide();
		
	});

}

/**
 * Function to load the entry form with data from the registery.
 * 
 * @returns
 */
function EditRegisterEntry(data) {

	/** Loading all the data into the form */
	
	$('#payee_id').val(data.payee_id);
	$('#category_id').val(data.category_id);
	$('#type').val(data.type);
	$('#memo').val(data.memo);
	$('#amount').val(Math.abs(data.amount).toFixed(2));
	$('#check_num').val(data.check_num);
	$( "#date" ).datepicker('option', 'dateFormat', 'yy-mm-dd');
	$( "#date" ).datepicker('setDate', data.date);
	$( "#date" ).datepicker('option', 'dateFormat', 'M d, yy');
	$('#addRegisterItem').text('Update').data('account_entries_id', data.account_entries_id);
	
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
	
		/** Now set the Register DIV to the available height */
		$('#Register').height(useableHeight);
		
		/** Removing the padding around the two div */
		useableHeight -= ( $('#RegisterList').outerHeight(true) + $('#RegisterEntry').outerHeight(true) - $('#RegisterList').height() - $('#RegisterEntry').height() );

		/** Removing the height of the register entry form */ 
		useableHeight -= $('.register-entry').outerHeight(true);

		/** Maintianing at least x pixels */
		useableHeight = (useableHeight < 300 ? 300 : useableHeight);
		
		/** Set the height of the Register List to the remaining value */
		$('#RegisterList').height(useableHeight);
		
		/** Set the height of the Registers List Scrollable container */
		$('#registerListContainer').height(useableHeight - $('#RegisterListHeader').outerHeight(true));

		/** Need to check to height of the background DIV to make sure it is at least the combined height of both inner divs. */
		if( $('#Register').height() < ($('#RegisterList').outerHeight(true) + $('#RegisterEntry').outerHeight(true)) ) {
			/** If it isn't then force it */
			$('#Register').height($('#RegisterList').outerHeight(true) + $('#RegisterEntry').outerHeight(true));
		}
		
	}
}

/**
 * Function to maintain the widths of the form entry
 * 
 * @returns void
 */
function MaintainWidths() {
	/** Check to see if the window width has changed */
	if( lastWindowWidth != $(window).width() ) {
		/** If it has, resize stuff */
		
		/** Storing the last value */
		lastWindowWidth = $(window).width();
		
		/** Resetting the width to auto */
		$('.colOne').width('auto');
		$('.colThree').width('auto');
		
		/** Finding the max width of each form heading */
		columnOneWidth = Math.max.apply(Math, $('.colOne').map(function(){ return $(this).outerWidth(true); }).get());
		columnThreeWidth = Math.max.apply(Math, $('.colThree').map(function(){ return $(this).outerWidth(true); }).get());
		
		/** Hardcoding the Widths */
		$('.colOne').width(columnOneWidth);
		$('.colThree').width(columnThreeWidth);
		
	}
	
}
