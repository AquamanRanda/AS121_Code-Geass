import React, { Component } from 'react';

export class EditLabel extends Component {
	state = { edit: false };

	onClickHandler = () => {
		this.setState((st) => {
			return { ...st, edit: st.edit ? false : true };
		});
	};

	render() {
		return (
			<React.Fragment>
				{this.state.edit ? (
					<input
						autoFocus
						onKeyDown={(event) => {
							event.keyCode === 13 &&
								this.setState({ edit: false });
						}}
						onBlur={() => {
							this.setState({ edit: false });
						}}
						type='text'
						onChange={this.props.onChange}
						value={this.props.children}
					/>
				) : (
					<div
						style={{ minWidth: '100px' }}
						onClick={this.onClickHandler}>
						{this.props.children}
					</div>
				)}
			</React.Fragment>
		);
	}
}

export default EditLabel;
