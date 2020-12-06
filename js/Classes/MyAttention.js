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
		modal : true
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
 * @param options - Object containing various options: {type: 'generic, info, warning, error', title: 'New Title',  buttons: {}, onClose: 'function(), Logout, Disabled', beforeOnClose: function()}
 * @returns
 */
MyAttention.prototype.show = function (contents, options) {
	/** If no options were supplied create an empty object. */
	if(!options) var options = new Object;

	/** Removing any old data */
	$('#'+ this.name +'-div').removeClass('ui-state-error ui-state-highlight').html('');
	
	if( options.type == 'generic') {
		/** If type is generic */
		$('#'+ this.name).dialog( 'option', 'title', (options.title ? options.title : 'Money Warp') );
	} else {
		/** Else it is a normal info/warning/error dialog box */
		if ( options.type == 'info') {
			/** If type is info */
			$('#'+ this.name).dialog( 'option', 'title', (options.title ? options.title : 'Information') );
		} else if ( options.type == 'warning') {
			/** If type is warning */
			$('#'+ this.name).dialog( 'option', 'title', (options.title ? options.title : 'Warning') );
			$('#'+ this.name +'-div').addClass('ui-state-highlight');
		} else {
			/** Default will be error. */
			$('#'+ this.name).dialog( 'option', 'title', (options.title ? options.title : 'Error') );
			$('#'+ this.name +'-div').addClass('ui-state-error');
		}
	}
	
	/** Adding the contents */
	$('#'+ this.name +'-div').append(contents);
	
	/** Adding the button(s) */
	$('#'+ this.name).dialog( "option", "buttons", (options.buttons ? options.buttons : { "Close": function() { $(this).dialog('close'); } } ) );

	/** Removing any previously attached dialogclose events. */
	$('#'+ this.name).off( "dialogclose" );

	/** Removing any previously attached dialogbeforeclose events */ 
	$('#'+ this.name).off( "dialogbeforeclose" );
	
	/** Binding onClose function */
	if(typeof options.onClose === "function") {
		$('#'+ this.name).on( "dialogclose", function( event, ui ) {
			options.onClose();
		});
	} else if(options.onClose == 'Logout') {
		$('#'+ this.name).on( "dialogclose", function( event, ui ) {
			$('#'+ this.name).off( "dialogclose" );
			window.location.href = '../../';
		});
	} else if(typeof options.beforeOnClose === 'function') {
		$('#'+ this.name).on( "dialogbeforeclose", function() {
			return options.beforeOnClose();
		});
	} else if(options.onClose == 'Disabled') {
		/** Make the window uncloseable. */
		$('#'+ this.name).on( "dialogbeforeclose", function() {
			return false;
		});
	}

	/** Displaying the Dialog box */
	$('#'+ this.name).dialog('open');
	
	/** Fixing the width of the dialog box */
	this.SetWidth(500);
}


/*
 * Maintaining the Modal Box sizing
 */
MyAttention.prototype.SetWidth = function (maxWidth) {
	var availWidth = $(window).width() - 40; /** 40 for 20px margin on each side. */

	maxWidth = (maxWidth === undefined ? availWidth : (availWidth > maxWidth ? maxWidth : availWidth) );
	
	
	$('#'+ this.name).dialog( "option", "position", { my: "left top", at: "left top", of: window, within: window } );
	$('#'+ this.name).dialog( "option", "width", 'auto' );

	$('#'+ this.name).css("max-width", (maxWidth === undefined ? 'none' : maxWidth) );
	
	$('#'+ this.name).dialog( "option", "height", 'auto' );
	$('#'+ this.name).dialog( "option", "position", { my: "center top", at: "center top", of: window, within: window } );

}