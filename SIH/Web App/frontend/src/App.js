import React, { Component } from 'react';
import './styles/app.css';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect,
} from 'react-router-dom';
import Login from './Pages/Login';
import JwtDecode from 'jwt-decode';
// import axios from 'axios';
import axios from './util/axiosinstance';

import AuthRoute from './Components/AuthRoute';

import DCPU from './Pages/DCPU';

import CWC from './Pages/CWC';

import PO from './Pages/PO';

import Home from './Pages/Home';

import EditChild from './Pages/EditChild';
import CreateChild from './Pages/CreateChild';
import Child from './Pages/Child';

import CreateEmployee from './Pages/CreateEmployee';
import Employee from './Pages/Employee';
import EditEmployee from './Pages/EditEmployee';

import CreateCCI from './Pages/CreateCCI';
import CCI from './Pages/CCI';
import EditCCI from './Pages/EditCCI';

import CreateGuardian from './Pages/CreateGuardian';
import Guardian from './Pages/Guardian';
import EditGuardian from './Pages/EditGuardian';

export class App extends Component {
	state = { authenticated: false, role: '', organisation: '', district: '' };

	setUserDataPostLogin = (role, token, organisation, district) => {
		axios.defaults.headers['Authorization'] = `Bearer ${token}`;
		this.setState(
			{ role, token, organisation, authenticated: true, district },
			this.setTokenTimer(3600 * 1000)
		);
	};

	setTokenTimer = (time) => () => {
		setTimeout(() => {
			// logout
			localStorage.removeItem('token');
			localStorage.removeItem('role');
			localStorage.removeItem('organisation');
			this.setState({
				authenticated: false,
				role: '',
				token: '',
				organisation: '',
				district: '',
			});
			console.log('logging out');
			window.location.href = '/login';
		}, time);
	};

	componentDidMount = () => {
		let authenticated;
		const token = localStorage.token;
		if (token) {
			const decodedToken = JwtDecode(token);
			if (decodedToken.exp * 1000 < Date.now()) {
				console.log('expired token');
				authenticated = false;
			} else {
				let endTime = new Date(decodedToken.exp * 1000);
				let startTime = new Date();
				var milliseconds = endTime.getTime() - startTime.getTime();
				this.setTokenTimer(milliseconds);
				authenticated = true;
				this.setState({
					token: token,
					role: decodedToken.role,
					organisation: decodedToken.organisation,
					district: localStorage.district,
				});
				axios.defaults.headers['Authorization'] = token;
			}
			this.setState({ authenticated });
		}
	};

	render() {
		// let x;
		// if (!this.state.authenticated) {
		// 	// let x = this.props.history.push('/login');
		// 	x = <Redirect to='/login' />;
		// }

		return (
			<div>
				<Router>
					<Switch>
						<AuthRoute
							path='/'
							token={this.state.token}
							role={this.state.role}
							organisation={this.state.organisation}
							district={this.state.district}
							exact
							authenticated={this.state.authenticated}
							component={Home}
						/>
						<Route
							exact
							path='/login'
							render={(props) => (
								<Login
									{...props}
									authenticated={this.state.authenticated}
									setUserDataPostLogin={
										this.setUserDataPostLogin
									}
								/>
							)} // login
						/>
						<AuthRoute
							path='/employee/create'
							exact
							axios={axios}
							authenticated={this.state.authenticated}
							component={CreateEmployee}
						/>{' '}
						{/* emp create */}
						<AuthRoute
							path='/employee/:id'
							exact
							role={this.state.role}
							axios={axios}
							authenticated={this.state.authenticated}
							component={Employee}
						/>{' '}
						{/* emp read */}
						<AuthRoute
							path='/employee/:id/edit'
							exact
							district={this.state.district}
							axios={axios}
							authenticated={this.state.authenticated}
							component={EditEmployee}
						/>{' '}
						{/* emp update */}
						<AuthRoute
							path='/PO/:id'
							exact
							authenticated={this.state.authenticated}
							component={PO}
						/>{' '}
						{/* PO read */}
						<AuthRoute
							path='/CCI/create/:empname/:empid'
							exact
							authenticated={this.state.authenticated}
							component={CreateCCI}
							organisation={this.state.organisation}
						/>{' '}
						{/* CCI create */}
						<AuthRoute
							path='/CCI/:id'
							exact
							role={this.state.role}
							district={this.state.district}
							authenticated={this.state.authenticated}
							component={CCI}
						/>{' '}
						{/* CCI read */}
						<AuthRoute
							path='/CCI/:id/edit'
							exact
							role={this.state.role}
							district={this.state.district}
							authenticated={this.state.authenticated}
							component={EditCCI}
						/>{' '}
						{/* CCI edit */}
						<AuthRoute
							path='/child/:id/edit'
							exact
							authenticated={this.state.authenticated}
							component={EditChild}
						/>{' '}
						{/* child update */}
						<AuthRoute
							path='/child/create'
							exact
							authenticated={this.state.authenticated}
							component={CreateChild}
						/>{' '}
						{/* child create */}
						<AuthRoute
							path='/child/:id'
							exact
							authenticated={this.state.authenticated}
							component={Child}
						/>{' '}
						{/* child create */}
						<AuthRoute
							path='/child/:id/guardian/create'
							exact
							axios={axios}
							authenticated={this.state.authenticated}
							component={CreateGuardian}
						/>{' '}
						{/* Guardian create */}
						<AuthRoute
							path='/guardian/:id'
							exact
							axios={axios}
							authenticated={this.state.authenticated}
							component={Guardian}
						/>{' '}
						{/* guardian read */}
						<AuthRoute
							path='/guardian/:id/edit'
							exact
							authenticated={this.state.authenticated}
							component={EditGuardian}
						/>{' '}
						{/* guardian edit */}
						<AuthRoute
							path='/DCPU/:id'
							exact
							authenticated={this.state.authenticated}
							component={DCPU}
						/>{' '}
						{/* dcpu read */}
						<AuthRoute
							path='/CWC'
							exact
							authenticated={this.state.authenticated}
							component={CWC}
						/>{' '}
						{/* cwc read */}
					</Switch>
				</Router>
			</div>
		);
	}
}

export default App;
