(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var GameBoard = require('./classes/GameBoard.jsx');

React.render(React.createElement(GameBoard, null), document.getElementById('GameBoard'));

},{"./classes/GameBoard.jsx":5}],2:[function(require,module,exports){

var Swipeable = React.createClass({displayName: "Swipeable",
  propTypes: {
    onSwiped: React.PropTypes.func,
    onSwipingUp: React.PropTypes.func,
    onSwipingRight: React.PropTypes.func,
    onSwipingDown: React.PropTypes.func,
    onSwipingLeft: React.PropTypes.func,
    onSwipedUp: React.PropTypes.func,
    onSwipedRight: React.PropTypes.func,
    onSwipedDown: React.PropTypes.func,
    onSwipedLeft: React.PropTypes.func,
    flickThreshold: React.PropTypes.number,
    delta: React.PropTypes.number
  },

  getInitialState: function () {
    return {
      x: null,
      y: null,
      swiping: false,
      start: 0
    }
  },

  getDefaultProps: function () {
    return {
      flickThreshold: 0.6,
      delta: 10
    }
  },

  calculatePos: function (e) {
    var x = e.changedTouches[0].clientX
    var y = e.changedTouches[0].clientY

    var xd = this.state.x - x
    var yd = this.state.y - y

    var axd = Math.abs(xd)
    var ayd = Math.abs(yd)

    return {
      deltaX: xd,
      deltaY: yd,
      absX: axd,
      absY: ayd
    }
  },

  touchStart: function (e) {
    if (e.touches.length > 1) {
      return
    }
    this.setState({
      start: Date.now(),
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      swiping: false
    })
  },

  touchMove: function (e) {
    if (!this.state.x || !this.state.y || e.touches.length > 1) {
      return
    }

    var cancelPageSwipe = false
    var pos = this.calculatePos(e)

    if (pos.absX < this.props.delta && pos.absY < this.props.delta) {
      return
    }

    if (pos.absX > pos.absY) {
      if (pos.deltaX > 0) {
        if (this.props.onSwipingLeft) {
          this.props.onSwipingLeft(e, pos.absX)
          cancelPageSwipe = true
        }
      } else {
        if (this.props.onSwipingRight) {
          this.props.onSwipingRight(e, pos.absX)
          cancelPageSwipe = true
        }
      }
    } else {
      if (pos.deltaY > 0) {
        if (this.props.onSwipingUp) {
          this.props.onSwipingUp(e, pos.absY)
          cancelPageSwipe = true
        }
      } else {
        if (this.props.onSwipingDown) {
          this.props.onSwipingDown(e, pos.absY)
          cancelPageSwipe = true
        }
      }
    }

    this.setState({ swiping: true })

    if (cancelPageSwipe) {
      e.preventDefault()
    }
  },

  touchEnd: function (ev) {
    if (this.state.swiping) {
      var pos = this.calculatePos(ev)

      var time = Date.now() - this.state.start
      var velocity = Math.sqrt(pos.absX * pos.absX + pos.absY * pos.absY) / time
      var isFlick = velocity > this.props.flickThreshold

      this.props.onSwiped && this.props.onSwiped(
        ev,
        pos.deltaX,
        pos.deltaY,
        isFlick
      )
      
      if (pos.absX > pos.absY) {
        if (pos.deltaX > 0) {
          this.props.onSwipedLeft && this.props.onSwipedLeft(ev, pos.deltaX)
        } else {
          this.props.onSwipedRight && this.props.onSwipedRight(ev, pos.deltaX)
        }
      } else {
        if (pos.deltaY > 0) {
          this.props.onSwipedUp && this.props.onSwipedUp(ev, pos.deltaY)
        } else {
          this.props.onSwipedDown && this.props.onSwipedDown(ev, pos.deltaY)
        }
      }
    }
    
    this.setState(this.getInitialState())
  },

  render: function () {
    return (
      React.createElement("div", React.__spread({},  this.props, 
        {onTouchStart: this.touchStart, 
        onTouchMove: this.touchMove, 
        onTouchEnd: this.touchEnd}), 
          this.props.children
      )  
    )
  }
})

module.exports = Swipeable

},{}],3:[function(require,module,exports){
'use strict';

module.exports = React.createClass({
	displayName: 'exports',

	render: function render() {
		var cardClass = 'Card';
		if (this.props.data['new']) {
			cardClass += ' is-new';
		}
		if (this.props.data.merged) {
			cardClass += ' is-merged';
		}
		return React.createElement(
			'div',
			{ className: 'Card-wrap u-position' + this.props.data.x + 'x' + this.props.data.y },
			React.createElement('div', { className: cardClass, 'data-value': this.props.data.value })
		);
	}
});

},{}],4:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var storage = require('./Storage');

var Deck = (function () {
	function Deck() {
		_classCallCheck(this, Deck);

		this.cardKey = storage.get('cardKey') || 0;
		var state = storage.getJSON('gameState');
		if (state) {
			this.cards = state.cards;
		} else {
			this.reset();
		}
	}

	_createClass(Deck, [{
		key: 'addCard',
		value: function addCard() {

			var spaces = this.getFreeSpaces();
			if (spaces.length) {
				this.cardKey++;
				storage.set('cardKey', this.cardKey);
				var i = Math.round(Math.random() * (spaces.length - 1));
				var card = {
					'new': true,
					key: 'card' + this.cardKey,
					value: (Math.round(Math.random()) + 1) * 2,
					x: spaces[i][0],
					y: spaces[i][1]
				};
				this.cards.push(card);
			}
			return this;
		}
	}, {
		key: 'reset',
		value: function reset() {
			this.cards = [];
			this.addCard().addCard();
			return this;
		}
	}, {
		key: 'prune',
		value: function prune() {
			var cards = [];
			for (var i = 0; i < this.cards.length; i++) {
				var card = this.cards[i];
				card['new'] = card.merged = false;
				if (!card.duplicate) {
					cards.push(card);
				}
			}
			this.cards = cards;
			return this;
		}
	}, {
		key: 'getFreeSpaces',
		value: function getFreeSpaces() {

			var taken = { 0: {}, 1: {}, 2: {}, 3: {} };
			for (var i = 0; i < this.cards.length; i++) {
				var card = this.cards[i];
				taken[card.x][card.y] = true;
			}

			var free = [];
			for (var x = 0; x < 4; x++) {
				for (var y = 0; y < 4; y++) {
					if (!taken[x][y]) {
						free.push([x, y]);
					}
				}
			}
			return free;
		}
	}, {
		key: 'getCards',
		value: function getCards() {
			return this.cards;
		}
	}, {
		key: 'getCardsByAxis',
		value: function getCardsByAxis(axis, val) {

			var cards = [];
			for (var i = 0; i < this.cards.length; i++) {
				var card = this.cards[i];
				if (card[axis] == val) {
					cards.push(card);
				}
			}
			return cards;
		}
	}]);

	return Deck;
})();

module.exports = Deck;

},{"./Storage":8}],5:[function(require,module,exports){
'use strict';

var Card = require('./Card.jsx');
var Modal = require('./Modal.jsx');
var Scoreboard = require('./Scoreboard.jsx');
var Swipeable = require('react-swipeable');

var deck = new (require('./Deck'))();
var storage = require('./Storage');

var locked = false;

module.exports = React.createClass({
	displayName: 'exports',

	getInitialState: function getInitialState() {
		var gameState = storage.getJSON('gameState') || {};
		return {
			score: gameState.score || 0,
			highScore: storage.getInt('highScore') || 0,
			gameOver: false,
			cards: deck.getCards(),
			modal: {
				buttons: []
			}
		};
	},
	reset: function reset() {
		this.setState({
			score: 0,
			gameOver: false,
			menuOpen: false,
			cards: deck.reset().getCards(),
			modal: {
				buttons: []
			}
		});
		storage.setJSON('gameState', {
			score: 0,
			cards: deck.getCards()
		});
		return this;
	},
	openMenu: function openMenu() {
		this.setState({
			menuOpen: true,
			modal: {
				title: 'Menu',
				buttons: [{
					text: 'Resume',
					className: 'u-blue',
					action: this.closeMenu
				}, {
					text: 'New Game',
					className: 'u-red',
					action: this.reset
				}]
			}
		});
	},
	closeMenu: function closeMenu() {
		this.setState({
			menuOpen: false,
			modal: {
				buttons: []
			}
		});
	},
	slide: function slide(direction, test) {

		if (locked && !test || this.state.gameOver) return;

		if (!test) {
			locked = true;
			deck.prune();
		}

		var axis = direction === 'up' || direction === 'down' ? 'x' : 'y';
		var altAxis = axis === 'x' ? 'y' : 'x';
		var sort = direction === 'up' || direction === 'left' ? 1 : -1;
		var rowFirst = sort === 1 ? 0 : 3;
		var moved = false;
		var score = this.state.score;
		var i;

		for (i = 0; i < 4; i++) {
			var row = deck.getCardsByAxis(axis, i).sort(function (a, b) {
				return a[altAxis] > b[altAxis] ? sort : -sort;
			});
			var j;
			for (j = 0; j < row.length; j++) {
				var card = row[j];
				var prevCard = row[j - 1];
				if (test) {
					card = Object.create(card);
					if (prevCard) {
						prevCard = Object.create(prevCard);
					}
				}
				var oldCoord = card[altAxis];
				if (!prevCard) {
					card[altAxis] = rowFirst;
				} else if (prevCard.value === card.value && !prevCard.duplicate) {
					card[altAxis] = prevCard[altAxis];
					card.duplicate = true;
					card.value = prevCard.value = card.value * 2;
					card.merged = prevCard.merged = true;
					score += card.value;
				} else {
					card[altAxis] = prevCard[altAxis] + sort;
				}
				if (oldCoord !== card[altAxis]) {
					moved = true;
				}
			}
		}

		if (test) {
			return moved;
		}
		if (moved) {
			var newState = {
				score: score,
				cards: deck.addCard().getCards()
			};
			this.setState(newState);
			storage.setJSON('gameState', newState);
		}
		if (!this.canSlide()) {
			this.gameOver();
		}
		setTimeout(function () {
			locked = false;
		}, 150);

		return this;
	},
	slideTest: function slideTest(direction) {
		return this.slide(direction, true);
	},
	slideUp: function slideUp() {
		return this.slide('up');
	},
	slideLeft: function slideLeft() {
		return this.slide('left');
	},
	slideRight: function slideRight() {
		return this.slide('right');
	},
	slideDown: function slideDown() {
		return this.slide('down');
	},
	handleKeyDown: function handleKeyDown(e) {

		var keycode = e.keyCode;
		if (keycode == 38) {
			// up
			e.preventDefault();
			this.slideUp();
		} else if (keycode == 37) {
			// left
			e.preventDefault();
			this.slideLeft();
		} else if (keycode == 39) {
			// right
			e.preventDefault();
			this.slideRight();
		} else if (keycode == 40) {
			// down
			e.preventDefault();
			this.slideDown();
		} else if (keycode == 27) {
			// for debug
			e.preventDefault();
			this.gameOver(0);
		}
	},
	canSlide: function canSlide() {
		return deck.getFreeSpaces().length || this.slideTest('up') || this.slideTest('left') || this.slideTest('right') || this.slideTest('down');
	},
	gameOver: function gameOver(pause) {
		var board = this;
		if (typeof pause === 'undefined') pause = 2000;
		var newState = {
			gameOver: true,
			modal: {
				title: 'Game Over!',
				message: 'Your Score: ' + this.state.score,
				buttons: [{
					text: 'Play Again',
					action: this.reset,
					className: 'u-blue'
				}]
			}
		};
		if (this.state.score > this.state.highScore) {
			storage.set('highScore', this.state.score);
			newState.highScore = this.state.score;
		}

		setTimeout(function () {
			board.setState(newState);
		}, pause);
	},
	preventDefault: function preventDefault(e) {
		e.preventDefault();
	},
	componentDidMount: function componentDidMount() {
		document.addEventListener('keydown', this.handleKeyDown);
		document.addEventListener('touchmove', this.preventDefault);
	},

	componentWillUnmount: function componentWillUnmount() {
		document.removeEventListener('keydown', this.handleKeyDown);
		document.removeEventListener('touchmove', this.preventDefault);
	},
	render: function render() {
		var i;
		var background = [];
		for (i = 0; i < 16; i++) {
			background.push(React.createElement('div', { key: 'bg' + i, className: 'GameBoard-backgroundCard' }));
		}

		var cards = [];
		var _deck = this.state.cards;
		for (i = 0; i < _deck.length; i++) {
			cards.push(React.createElement(Card, { key: _deck[i].key, data: _deck[i] }));
		}

		var rootClassName = 'Container';
		if (this.state.gameOver) {
			rootClassName += ' is-gameOver';
		} else if (this.state.menuOpen) {
			rootClassName += ' is-menuOpen';
		}

		return React.createElement(
			'div',
			{ className: rootClassName },
			React.createElement(
				Swipeable,
				{ className: 'Swipeable',
					onSwipedUp: this.slideUp,
					onSwipedLeft: this.slideLeft,
					onSwipedRight: this.slideRight,
					onSwipedDown: this.slideDown
				},
				React.createElement(Scoreboard, { data: { score: this.state.score, highScore: this.state.highScore, openMenu: this.openMenu } }),
				React.createElement(
					'div',
					{ className: 'GameBoard' },
					React.createElement(
						'div',
						{ className: 'GameBoard-background' },
						background
					),
					cards
				)
			),
			React.createElement(Modal, { data: this.state.modal })
		);
	}
});

},{"./Card.jsx":3,"./Deck":4,"./Modal.jsx":6,"./Scoreboard.jsx":7,"./Storage":8,"react-swipeable":2}],6:[function(require,module,exports){
"use strict";

module.exports = React.createClass({
	displayName: "exports",

	render: function render() {

		var buttons = [];

		if (this.props.data.buttons) {
			for (var i = 0; i < this.props.data.buttons.length; i++) {
				var button = this.props.data.buttons[i];
				buttons.push(React.createElement(
					"button",
					{ key: "button" + i, className: button.className, onClick: button.action },
					button.text
				));
			}
		}

		return React.createElement(
			"div",
			{ className: "Modal" },
			React.createElement(
				"h2",
				null,
				this.props.data.title
			),
			React.createElement(
				"p",
				null,
				this.props.data.message
			),
			React.createElement(
				"div",
				null,
				buttons
			)
		);
	}
});

},{}],7:[function(require,module,exports){
'use strict';

module.exports = React.createClass({
	displayName: 'exports',

	render: function render() {

		var scoreClass = 'Score-card-value Score-card-value--' + this.props.data.score.toString().length;
		var bestClass = 'Score-card-value Score-card-value--' + this.props.data.highScore.toString().length;

		return React.createElement(
			'div',
			{ className: 'Score' },
			React.createElement(
				'div',
				{ className: 'Score-card' },
				'Score:',
				React.createElement(
					'span',
					{ className: scoreClass },
					this.props.data.score
				)
			),
			React.createElement(
				'div',
				{ className: 'Score-card Score-card--best' },
				'Best:',
				React.createElement(
					'span',
					{ className: bestClass },
					this.props.data.highScore
				)
			),
			React.createElement(
				'button',
				{ className: 'u-orange', onClick: this.props.data.openMenu },
				'Menu'
			)
		);
	}
});

},{}],8:[function(require,module,exports){
"use strict";

var localStorage = window.localStorage || new function () {

	this.storage = {};

	this.setItem = function (key, value) {
		this.storage[key] = value;
		return this;
	};

	this.getItem = function (key) {
		return this.storage[key];
	};

	this.removeItem = function (key) {
		delete this.storage[key];
		return this;
	};
}();

var cachedJSON = {};

module.exports = {

	set: function set(key, value) {
		localStorage.setItem(key, value);
		return this;
	},

	setJSON: function setJSON(key, value) {
		cachedJSON[key] = value;
		return this.set(key, JSON.stringify(value));
	},

	get: function get(key) {
		return localStorage.getItem(key);
	},

	getInt: function getInt(key) {
		return parseInt(this.get(key), 10);
	},

	getJSON: function getJSON(key) {
		return cachedJSON[key] || (cachedJSON[key] = JSON.parse(this.get(key)));
	},

	remove: function remove(key) {
		if (cachedJSON[key]) {
			delete cachedJSON[key];
		}
		localStorage.removeItem(key);
		return this;
	}
};

},{}]},{},[1]);
