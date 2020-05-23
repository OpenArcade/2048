var Card = require('./Card.jsx');
var Modal = require('./Modal.jsx');
var Scoreboard = require('./Scoreboard.jsx');
var Swipeable = require('react-swipeable');

var deck = new (require('./Deck'))();
var storage = require('./Storage');

var locked = false;

module.exports = React.createClass({
	getInitialState: function() {
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
	reset: function() {
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
	openMenu: function() {
		this.setState({
			menuOpen: true,
			modal: {
				title: "Menu",
				buttons: [
					{
						text: "Resume",
						className: 'u-blue',
						action: this.closeMenu
					},
					{
						text: "New Game",
						className: 'u-red',
						action: this.reset
					}
				]
			}
		})
	},
	closeMenu: function() {
		this.setState({
			menuOpen: false,
			modal: {
				buttons: []
			}
		});
	},
	slide: function(direction, test) {

		if (locked && !test || this.state.gameOver) return;

		if (!test) {
			locked = true;
			deck.prune();
		}

		var axis = (direction === 'up' || direction === 'down') ? 'x' : 'y';
		var altAxis = axis === 'x' ? 'y' : 'x';
		var sort = (direction === 'up' || direction === 'left') ? 1 : -1;
		var rowFirst = sort === 1 ? 0 : 3;
		var moved = false;
		var score = this.state.score;
		var i;

		for(i=0;i<4;i++) {
			var row = deck.getCardsByAxis(axis, i).sort(function(a, b) {
				return a[altAxis] > b[altAxis] ? sort : -sort;
			});
			var j;
			for(j=0;j<row.length;j++) {
				var card = row[j];
				var prevCard = row[j-1];
				if (test) {
					card = Object.create(card);
					if (prevCard) {
						prevCard = Object.create(prevCard);
					}
				}
				var oldCoord = card[altAxis];
				if (!prevCard) {
					card[altAxis] = rowFirst;
				}
				else if (prevCard.value === card.value && !prevCard.duplicate) {
					card[altAxis] = prevCard[altAxis];
					card.duplicate = true;
					card.value = prevCard.value = card.value*2;
					card.merged = prevCard.merged = true;
					score += card.value;
				}
				else {
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
		setTimeout(function() {
			locked = false;
		}, 150);

		return this;
	},
	slideTest: function(direction) {
		return this.slide(direction, true);
	},
	slideUp: function() {
		return this.slide('up');
	},
	slideLeft: function() {
		return this.slide('left');
	},
	slideRight: function() {
		return this.slide('right');
	},
	slideDown: function() {
		return this.slide('down');
	},
	handleKeyDown: function(e) {

		var keycode = e.keyCode;
		if (keycode == 38) { // up
			e.preventDefault();
			this.slideUp();
		}
		else if (keycode == 37) { // left
			e.preventDefault();
			this.slideLeft();
		}
		else if (keycode == 39) { // right
			e.preventDefault();
			this.slideRight();
		}
		else if (keycode == 40) { // down
			e.preventDefault();
			this.slideDown();
		}
		else if (keycode == 27) { // for debug
			e.preventDefault();
			this.gameOver(0);
		}
	},
	canSlide: function() {
		return (
			deck.getFreeSpaces().length
			||
			this.slideTest('up')
			||
			this.slideTest('left')
			||
			this.slideTest('right')
			||
			this.slideTest('down')
		);
	},
	gameOver: function(pause) {
		var board = this;
		if (typeof pause === 'undefined') pause = 2000;
		var newState = {
			gameOver: true,
			modal: {
				title: 'Game Over!',
				message: 'Your Score: ' + this.state.score,
				buttons: [
					{
						text: 'Play Again',
						action: this.reset,
						className: 'u-blue'
					}
				]
			}
		};
		if (this.state.score > this.state.highScore) {
			storage.set('highScore', this.state.score);
			newState.highScore = this.state.score;
		}

		setTimeout(function() {
			board.setState(newState);
		}, pause);
	},
	preventDefault: function(e) {
		e.preventDefault();
	},
	componentDidMount: function() {
		document.addEventListener('keydown', this.handleKeyDown);
		document.addEventListener('touchmove', this.preventDefault);
	},

	componentWillUnmount: function() {
		document.removeEventListener('keydown', this.handleKeyDown);
		document.removeEventListener('touchmove', this.preventDefault);
	},
	render: function() {
		var i;
		var background = [];
		for(i=0; i<16; i++) {
			background.push(<div key={'bg'+i} className="GameBoard-backgroundCard"></div>);
		}

		var cards = [];
		var _deck = this.state.cards;
		for(i=0; i<_deck.length; i++) {
			cards.push(<Card key={_deck[i].key} data={_deck[i]} />);
		}

		var rootClassName = 'Container';
		if (this.state.gameOver) {
			rootClassName += ' is-gameOver';
		}
		else if (this.state.menuOpen) {
			rootClassName += ' is-menuOpen';
		}

		return (
			<div className={rootClassName}>
				<Swipeable className="Swipeable"
					onSwipedUp={this.slideUp}
					onSwipedLeft={this.slideLeft}
					onSwipedRight={this.slideRight}
					onSwipedDown={this.slideDown}
				>
					<Scoreboard data={{score: this.state.score, highScore: this.state.highScore, openMenu: this.openMenu}} />
					<div className="GameBoard">
						<div className="GameBoard-background">
							{background}
						</div>
						{cards}
					</div>
				</Swipeable>
				<Modal data={this.state.modal} />
			</div>
		);
	}
});