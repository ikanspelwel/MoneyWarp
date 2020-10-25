
/**
 * MySessions constructor which does not
 * need to do anything.  
 * 
 * @returns void
 */
function MySessions() {
}

/**
 * @param sucessCallback function to call upon success
 * @param failCallback function to call if ajax fails
 */
MySessions.prototype.GetStatus = function (sucessCallback, failCallback) {
	
	$.ajax({
		url: 'php/session.php',
		type: 'POST',
		cache: 'false',
		data: {
			doWhat: 'checkActive'
		}
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		if(typeof failCallback === "function") {
			/** If this function exists call it with the return ajax vars */
			failCallback( jqXHR, textStatus, errorThrown );
		} else {
			/** If there wasn't a functoin provided just show a standard error */
			alert('A system error has occurred, please refresh and try again. If this error persists please report it.');
		}
	})
	.done(function(json) {
		/** Upon successful ajax call run the provided sucessCallback */
		sucessCallback( json );
	})

}