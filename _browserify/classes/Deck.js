var storage = require('./Storage');

class Deck {
	constructor() {
		this.cardKey = storage.get('cardKey') || 0;
		var state = storage.getJSON('gameState');
		if (state) {
			this.cards = state.cards;
		}
		else {
			this.reset();
		}
	}

	addCard() {

		var spaces = this.getFreeSpaces();
		if (spaces.length) {
			this.cardKey++;
			storage.set('cardKey', this.cardKey);
			var i = Math.round(Math.random()*(spaces.length-1));
			var card = {
				new: true,
				key: 'card' + this.cardKey,
				value: (Math.round(Math.random())+1)*2,
				x: spaces[i][0],
				y: spaces[i][1]
			};
			this.cards.push(card);
		}
		return this;
	}

	reset() {
		this.cards = [];
		this.addCard()
			.addCard();
		return this;
	}

	prune() {
		var cards = [];
		for(var i=0;i<this.cards.length;i++) {
			var card = this.cards[i];
			card.new = card.merged = false;
			if (!card.duplicate) {
				cards.push(card);
			}
		}
		this.cards = cards;
		return this;
	}

	getFreeSpaces() {

		var taken = {0:{},1:{},2:{},3:{}};
		for(var i=0;i<this.cards.length;i++) {
			var card = this.cards[i];
			taken[card.x][card.y] = true;
		}

		var free = [];
		for(var x=0;x<4;x++){
			for(var y=0;y<4;y++) {
				if (!taken[x][y]) {
					free.push([x,y]);
				}
			}
		}
		return free;
	}

	getCards() {
		return this.cards;
	}

	getCardsByAxis(axis, val) {

		var cards = [];
		for(var i=0;i<this.cards.length;i++) {
			var card = this.cards[i];
			if (card[axis] == val) {
				cards.push(card);
			}
		}
		return cards;
	}
}

module.exports = Deck;