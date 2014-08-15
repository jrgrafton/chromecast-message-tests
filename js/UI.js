function UI() {
	this.initUI_();
}

UI.prototype.initUI_ = function() {
	// Inject stats into DOM
	var node = document.createElement('span');
	node.id = "MessageTestsDebug"
	node.innerHTML = [
		"Test name: <span class='test-name'></span><br />",
		"Test status: <span class='test-status'></span><br />",
		"Messages dropped: <span class='test-messages-dropped'></span><br />",
		"Messages out of order: <span class='test-messages-out-of-order'></span><br />",
	].join("");
	console.log(node.innerHTML);
	document.body.appendChild(node);
}