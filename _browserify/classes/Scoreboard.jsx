module.exports = React.createClass({
	render: function() {

		var scoreClass = 'Score-card-value Score-card-value--' + this.props.data.score.toString().length;
		var bestClass = 'Score-card-value Score-card-value--' + this.props.data.highScore.toString().length;

		return (
			<div className="Score">
				<div className="Score-card">
					Score:
					<span className={scoreClass}>
						{this.props.data.score}
					</span>
				</div>
				<div className="Score-card Score-card--best">
					Best:
					<span className={bestClass}>
						{this.props.data.highScore}
					</span>
				</div>
				<button className="u-orange" onClick={this.props.data.openMenu}>Menu</button>
			</div>
		);
	}
});
