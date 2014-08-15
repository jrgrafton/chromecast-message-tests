function MessageTests() {
	this.testStatusEnum = {
		NOT_STARTED : "not started",
		IN_PROGRESS : "in progress",
		FINISHED : "finished"
	}

	this.debugMessageTimings = [];

	this.reset_();
}

MessageTests.prototype.reset_ = function() {
	console.debug("MessageTests: reset_()");

	this.currentTestName_ = "--";
	this.currentTestStatus_ = this.testStatusEnum.NOT_STARTED;
	
	// Set at test start
	this.messagesFirstTimestamp_ = -1;
	this.messageInterval_ = -1;

	// Set at test end
	this.messagesDropped_ = 0;
	this.messageDriftTotal_ = 0;

	// Updates upon each message
	this.messagesLastTimestamp_ = -1;  // Timestamp on receiver side
	this.messagesLastIndex_ = -1;
	this.messagesTotal_ = 0;
	this.messagesOutOfOrder_ = 0;
	this.messageDriftAverage_ = 0;
	this.messageDrifts_ = [];

	this.broadcastStatus_();
}

MessageTests.prototype.startTest_ = function(testName, messageInterval) {
	console.debug("MessageTests: startTest_({0}, {1})".format(testName,
		messageInterval));

	// Clear last test information
	this.reset_();

	this.currentTestName_ = testName;
	this.messageInterval_ = parseInt(messageInterval);

	this.currentTestStatus_ = this.testStatusEnum.IN_PROGRESS;
	this.messagesFirstTimestamp_ = new Date().getTime();
	this.messagesLastTimestamp_ = this.messagesFirstTimestamp_;

	// Broadcast updates
	this.broadcastStatus_();
}

MessageTests.prototype.finishTest_ = function(expectedMessageCount) {
	console.debug("MessageTests: finishTest_({0})".format(expectedMessageCount));

	this.currentTestStatus_ = this.testStatusEnum.FINISHED;
	this.messagesDropped_ = expectedMessageCount - this.messagesTotal_;
	this.messagesLastTimestamp_ = new Date().getTime();

	// Calculate total drift time
	this.messageDriftTotal_ = this.messageDrifts_.reduce(function(a, b) {
		return a + b;
	});


	// Broadcast updates
	this.broadcastStatus_("test-finished");
}

MessageTests.prototype.broadcastStatus_ = function(key_opt) {
	console.debug("MessageTests: broadcastStatus_({0})".format(key_opt));

	if(key_opt != null) {
		var stateEvent =  new Event(key_opt);
	} else {
		var stateEvent =  new Event("test-update");
	}

	stateEvent.data = this.getState();
	document.dispatchEvent(stateEvent);
}

// Start: Public functions
MessageTests.prototype.initializeCastMessageBus = function() {
	console.debug("MessageTests: initializeCastMessageBus()");

	this.castReceiverManager =
		cast.receiver.CastReceiverManager.getInstance();
	this.messageTestsMessageBus =
		this.castReceiverManager.getCastMessageBus('urn:x-cast:com.jg.messageTests');
	this.messageTestsMessageBus.onMessage(function(event) {
		this.processMessage(event.message);
	}.bind(this));

	// TODO: subscribe to test-finished and send event back to senders
}
MessageTests.prototype.processMessage = function(msg) {
	console.debug("MessageTests: processMessage({0})".format(msg));
	this.debugMessageTimings.push(new Date().getTime());

	var components = msg.split(":");
	if(components[0] === "begin") {
		this.startTest_(components[1], components[2]);
	} else if(components[0] === "end") {
		this.finishTest_(components[1]);
	} else {
		// Validate message structure
		if(components.length !== 1 || isNaN(components[0])) {
			return;
		}

		// Local vars
		var messageIndex = components[0];

		// Message index operations
		if(++this.messagesLastIndex_ != parseInt(messageIndex)) {
			++this.messagesOutOfOrder_;
			this.messagesLastIndex_ = messageIndex;
		}

		// Drift operations
		var expectedTime = this.messagesLastTimestamp_ + this.messageInterval_;
		var actualTime = new Date().getTime();
		var drift = actualTime - expectedTime;
		this.messageDrifts_.push(drift);

		// Update average 
		this.messageDriftAverage_ = Math.round(
			this.messageDrifts_.reduce(function(a, b) {
    			return Math.abs(a) + Math.abs(b);
			}) / this.messageDrifts_.length);
		this.messagesLastTimestamp_ = actualTime;

		// Increment messages total
		++this.messagesTotal_;

		this.broadcastStatus_();
	}
}

MessageTests.prototype.getState = function() {
	console.debug("MessageTests: getState()");

	return {
		current_test_name : this.currentTestName_,
		current_test_status : this.currentTestStatus_,
		messages_total : this.messagesTotal_,
		messages_dropped : this.messagesDropped_,
		messages_out_of_order : this.messagesOutOfOrder_,
		message_drift_average : this.messageDriftAverage_,
		message_drift_total : this.messageDriftTotal_
	}
}