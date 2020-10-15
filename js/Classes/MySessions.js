
/**
 * MySessions constructor which does not
 * need to do anything.  
 * 
 * @returns void
 */
function MySessions() {
	var test = 'k';
}

MySessions.prototype.GetStatus = function (sucessCallback, failCallback) {
	
	$.ajax({ // Generic ajax Call
		url: 'php/session.php',
		type: 'POST',
		cache: 'false',
		data: {
			doWhat: 'checkActive',
		}
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		if(typeof failCallback === "function") {
			failCallback( jqXHR, textStatus, errorThrown );
		} else {
			// Just show a standard error...
			alert('A system error has occurred, please refresh and try again. If this error persists please report it.');
		}
	})
	.done(function(json) {
		sucessCallback( json );
	})

}