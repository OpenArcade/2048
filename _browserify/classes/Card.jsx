module.exports = React.createClass({
	render: function() {
		var cardClass = 'Card';
		if (this.props.data.new) {
			cardClass += ' is-new';
		}
		if (this.props.data.merged) {
			cardClass += ' is-merged';
		}
		return (
			<div className={'Card-wrap u-position' + this.props.data.x + 'x' + this.props.data.y}>
				<div className={cardClass} data-value={this.props.data.value}></div>
			</div>
		);
	}
});