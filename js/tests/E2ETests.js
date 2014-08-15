function E2ETests() {
	// Static vars
	this.MESSAGE_INTERVAL = 50; // in ms
	this.MESSAGE_COUNT = 30;
	this.TEST_NAME = "mock-test";

	// Member vars
	this.iterations = 0;
	this.testIntervalObject = null;

	this.messageTests_ = new MessageTests();
}

E2ETests.prototype.runTests = function() {
	console.debug("E2ETests: runTests()");

	// Attach listener so that results can be validated
	this.subscribeToEvents_();

	// Run actual tests
	this.testIntervalObject = setInterval(function() {
		if(this.iterations === 0) {
			this.messageTests_.processMessage("begin:{0}:{1}".format(
				this.TEST_NAME, this.MESSAGE_INTERVAL));
		} else if(this.iterations > this.MESSAGE_COUNT) {
			this.messageTests_.processMessage("end:{0}".format(
				this.MESSAGE_COUNT));
			clearInterval(this.testIntervalObject);
		} else {
			this.messageTests_.processMessage("" + (this.iterations - 1));
		}
		++this.iterations;
	}.bind(this), this.MESSAGE_INTERVAL);
}

E2ETests.prototype.subscribeToEvents_ = function() {
	console.debug("E2ETests: subscribeToEvents_()");

	document.addEventListener("test-finished", function(e) {
		this.validateResults_(e.data);
	}.bind(this));
}

E2ETests.prototype.validateResults_ = function(results) {
	console.debug("E2ETests: validateResults_({0})".format(results));

	// Assert that results are valid
	console.assert(results.current_test_name ===
		this.TEST_NAME, "Valid test name");
	console.assert(results.current_test_status ===
		this.messageTests_.testStatusEnum.FINISHED, "Valid test status");
	console.assert(results.messages_total === this.MESSAGE_COUNT,
		"Valid message total");
	console.assert(results.messages_out_of_order === 0,
		"All messages receiver in order");
	console.assert(results.message_drift_average < 10,
		"Drift average under 10ms");
	console.assert(results.message_drift_total < 50,
		"Drift total under 50ms");
}