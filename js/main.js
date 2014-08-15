window.onload = function() {
	var DEBUG = true;

	// Turn off logging when not in debugging
	if(!DEBUG) {
		console.log = function() {}
		console.debug = function() {}
		console.info = function() {}
	}

	// Start UI
	window.ui = new UI();

	// Load tests or receiver code depending on environment
	if(navigator.userAgent.indexOf("armv7l") === -1) {
		window.e2eTests = new E2ETests();
		window.e2eTests.runTests();
	} else {
		// On receiver - start message bus listener
		window.messageTests = new MessageTests();
		window.messageTests.initializeCastMessageBus();
	}
}







// For easier Logging...
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : ""
      ;
    });
  };
}