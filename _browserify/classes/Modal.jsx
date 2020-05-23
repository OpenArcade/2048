module.exports = React.createClass({
	render: function() {

		var buttons = [];

		if (this.props.data.buttons) {
			for(var i=0;i<this.props.data.buttons.length;i++) {
				var button = this.props.data.buttons[i];
				buttons.push(<button key={'button'+i} className={button.className} onClick={button.action}>{button.text}</button>);
			}
		}

		return (
			<div className="Modal">
				<h2>{this.props.data.title}</h2>
				<p>{this.props.data.message}</p>
				<div>
					{buttons}
				</div>
			</div>
		);
	}
});