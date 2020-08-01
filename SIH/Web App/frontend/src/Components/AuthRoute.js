import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';

export class AuthRoute extends Component {
	render() {
		let {
			authenticated,
			// token,
			// role,
			// organisation,
			component: Render,
			...rest
		} = this.props;
		console.log(this.props.authenticated);
		return (
			<Route
				{...rest}
				render={(props) =>
					authenticated === false ? (
						<Redirect to='/login' />
					) : (
						<Render
							{...props}
							{...rest}
							authenticated={authenticated}
							// token={token}
							// role={role}
							// organisation={organisation}
						/>
					)
				}
			/>
		);
	}
}

export default AuthRoute;
