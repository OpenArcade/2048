var localStorage = window.localStorage || new (function() {

		this.storage = {};

		this.setItem = function(key, value) {
			this.storage[key] = value;
			return this;
		};

		this.getItem = function(key) {
			return this.storage[key];
		};

		this.removeItem = function(key) {
			delete this.storage[key];
			return this;
		}
})();

var cachedJSON = {};

module.exports = {

	set: function(key, value) {
		localStorage.setItem(key, value);
		return this;
	},

	setJSON: function(key, value) {
		cachedJSON[key] = value;
		return this.set(key, JSON.stringify(value));
	},

	get: function(key) {
		return localStorage.getItem(key);
	},

	getInt: function(key) {
		return parseInt(this.get(key), 10);
	},

	getJSON: function(key) {
		return cachedJSON[key] || (cachedJSON[key] = JSON.parse(this.get(key)));
	},

	remove: function(key) {
		if (cachedJSON[key]) {
			delete cachedJSON[key];
		}
		localStorage.removeItem(key);
		return this;
	}
};
