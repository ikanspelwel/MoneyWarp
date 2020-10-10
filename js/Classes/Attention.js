/**
 * When we initialize an instance of this class
 * add the appropriate DOM object to the DOM 
 * for dispalying the attention box.
 */
function MyAttention(name) {
	// Storing the ID name for this class
	this.name = name;
	
	/**
	 * Need to create the DOM object that is the destination
	 * for this Attention Box.
	 */
	$(document.body).append(
		$('<div>').attr('id', this.name).append(
			$('<div>').addClass('ui-corner-all').html(
				$('<div>').attr('id', this.name +'-div').addClass('ui-corner-all')
			)
		)
	);

	/**
	 * We need to initiate our modal before we
	 * can use it. 
	 */
	$('#'+ this.name).dialog({
		autoOpen : false,
		modal : true,
		open: function() {
			// Maintaining the Modal Box
			//MaintainingModalBox(500);
			//TODO either do this above or get rid of it.
		}
	}); // end of new dialog box

}


/**
 * This is my function to open an "Attention" dialog box.
 * 
 * First it will empty and reset the box. Second it will
 * set the desired icons and text states. Third it will add
 * either the default "close" button or the buttons that
 * were specified in the option object. Lastly it will 
 * open the dialog box.
 * 
 * @param contents - What to display in the dialog box
 * @param options - Object containing various options: {type: 'generic, info, warning, error', title: 'New Title',  buttons: {}, onClose: 'function(), Logout, Disabled', beforeOnClose: function(), doNotHideWaiting: true/false}
 * @returns
 */
MyAttention.prototype.show = function (contents, options) {
	// If no options were supplied create an empty object.
	if(!options) var options = new Object;

	if( options.type == 'generic') {
		// If type is generic 
		$('#'+ this.name +'-div').removeClass('ui-state-error ui-state-highlight').html(''); // Removing the old
		$('#'+ this.name).dialog( 'option', 'title', (options.title ? options.title : 'Applications') );
	} else {
		// Else it is a normal info/warning/error dialog box
		$('#'+ this.name +'-div').removeClass('ui-state-error ui-state-highlight').html(
			$('<div>').attr('id', this.name +'-icon').addClass('ui-icon')
		);
		if ( options.type == 'info') {
			// If type is info
			$('#'+ this.name).dialog( 'option', 'title', (options.title ? options.title : 'Information') );
			$('#'+ this.name +'-icon').addClass('ui-icon-info');
		} else if ( options.type == 'warning') {
			// If type is warning
			$('#'+ this.name).dialog( 'option', 'title', (options.title ? options.title : 'Warning') );
			$('#'+ this.name +'-icon').addClass('ui-icon-info');
			$('#'+ this.name +'-div').addClass('ui-state-highlight');
		} else {
			// Default will be error.
			$('#'+ this.name).dialog( 'option', 'title', (options.title ? options.title : 'Error') );
			$('#'+ this.name +'-icon').addClass('ui-icon-alert');
			$('#'+ this.name +'-div').addClass('ui-state-error');
		}
	}
	
	// Adding the mesage
	$('#'+ this.name +'-div').append(contents);
	
	// Adding any buttons
	$('#'+ this.name).dialog( "option", "buttons", (options.buttons ? options.buttons : { "Close": function() { $(this).dialog('close'); } } ) );

	// Binding onClose function
	if(typeof options.onClose === "function") {
		$('#'+ this.name).on( "dialogclose", function( event, ui ) {
			$('#'+ this.name).off( "dialogclose" );
			options.onClose();
		});
	} else if(options.onClose == 'Logout') {
		$('#'+ this.name).on( "dialogclose", function( event, ui ) {
			$('#'+ this.name).off( "dialogclose" );
			window.location.href = '/PHP/Logout.php';
		});
	} else if(typeof options.beforeOnClose === 'function') {
		$('#'+ this.name).on( "dialogbeforeclose", function() {
			return options.beforeOnClose();
		});
	} else if(options.onClose == 'Disabled') {
		// Make the window uncloseable. 
		$('#'+ this.name).on( "dialogbeforeclose", function() {
			return false;
		});
	} else {
		// Remove any attached events.
		$('#'+ this.name).off( "dialogclose" );

		// Allow the dialog box to be closed. 
		$('#'+ this.name).off( "dialogbeforeclose" );
	}

//	if(!options.doNotHideWaiting){
//		// Hide the waiting logo
//		Wait(false);
	//TODO either do this or get rid of it.
//	}

	// Displaying the Dialog box
	$('#'+ this.name).dialog('open');
}
