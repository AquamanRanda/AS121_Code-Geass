import React, { Component } from 'react';
import './styles/app.css';
import './styles/home.css';
import Footer from 'rc-footer';
import { render } from 'react-dom';
import 'rc-footer/assets/index.css';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	Redirect,
} from 'react-router-dom';
import Tilt from 'react-tilt';
import Login from './Pages/Login';
import JwtDecode from 'jwt-decode';
// import axios from 'axios';
import axios from './util/axiosinstance';

import Message from './Pages/Message';

import AuthRoute from './Components/AuthRoute';

import DCPU from './Pages/DCPU';

import Dictaphone from './Components/Dictaphone';

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

import Kiosk from  './Pages/Kiosk';

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

	logout = () => {
		localStorage.clear();
		this.setState({
			authenticated: false,
		});
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
					district: decodedToken.district,
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
			<Router>
				<div className='mx-auto p-4'>
					<header class='header border-2 border-black border-solid lg:px-16 px-6 bg-white flex flex-wrap items-center lg:py-0 py-2'>
						<div class='flex-1 flex justify-between items-center'>
							<Link to='/'>
								<Tilt
									className='Tilt pt-2 shadow-sm border-sm'
									options={{ max: 25 }}
									style={{ height: 100, width: 150 }}>
									<div className='Tilt-inner'>
										{' '}
										<img
											width='300'
											height='150'
											src='https://cdn.discordapp.com/attachments/658190768984293376/739762394284425257/dYZYIcfEmDAAAAAElFTkSuQmCC.png'
											alt='Logo'
										/>{' '}
									</div>
                                
								</Tilt>
							</Link>
						</div>
                        <div className="pt-2 text-center">
                                <img width='90' height='40' src="https://media.discordapp.net/attachments/658190768984293376/739696284545449994/emblem.png" alt="logo" /></div>
						<label
							for='menu-toggle'
							class='pointer-cursor lg:hidden block'>
							<svg
								class='fill-current text-gray-900'
								xmlns='http://www.w3.org/2000/svg'
								width='20'
								height='20'
								viewBox='0 0 20 20'>
								<title>menu</title>
								<path d='M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z'></path>
							</svg>
						</label>
						<input
							class='hidden'
							type='checkbox'
							id='menu-toggle'
						/>
    

						<div
							class='hidden lg:flex lg:items-center lg:w-auto w-full'
							id='menu'>
							<nav>
								<ul class='lg:flex items-center justify-between text-base text-gray-700 pt-4 lg:pt-0'>
									{this.state.authenticated && (
										<React.Fragment>
											<li
												onClick={this.logout}
												className='text-lg text-white lg:p-4 py-3 px-0 block border-b-2 border-transparent hover:border-indigo-400 '>
												Logout
											</li>
											<li className='text-lg text-white lg:p-4 py-3 px-0 block border-b-2 border-transparent hover:border-indigo-400 '>
												<Link to='/message'>
													Message
												</Link>
											</li>
                                            <li className='text-lg text-white lg:p-4 py-3 px-0 block border-b-2 border-transparent hover:border-indigo-400'>
                                                    <Link to='/kiosk'>
                                                        Feedback Kiosk
                                                    </Link>
                                            </li>
                                            <li className="text-lg text-white lg:p-4 py-3 px-0 block border-b-2 border-transparent hover:border-indigo-400">
                                                <Link to='/dictaphone'>
                                                    Speech-to-text
                                                </Link>
                                            </li>
										</React.Fragment>
									)}
								</ul>
							</nav>
						</div>
					</header>
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
							path='/kiosk'
							token={this.state.token}
							role={this.state.role}
							organisation={this.state.organisation}
							district={this.state.district}
							exact
							authenticated={this.state.authenticated}
							component={Kiosk}
						/>
                        <Route
							path='/dictaphone'
							token={this.state.token}
							role={this.state.role}
							organisation={this.state.organisation}
							district={this.state.district}
							exact
							authenticated={this.state.authenticated}
							component={Dictaphone}
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
						<AuthRoute
							path='/message'
							exact
							district={this.state.district}
							organisation={this.state.organisation}
							authenticated={this.state.authenticated}
							component={Message}
						/>{' '}
					</Switch>{' '}
                    <div className="pt-10">
                    <Footer className="footer"
    columns={[
      {
        title: 'Contact: 999999999',
        url: '',
        description: 'instragram',
        openExternal: true,
      },
      {
          title: 'Email: @gmail.com',
      },
      {
          title: 'Address: 233/1 R R Munt India-600028'
      }, {
          className: "footer-image",
          icon: (<img src="https://media.discordapp.net/attachments/658190768984293376/739757418896162896/left-logo.png" />),
      }
    ]}
    bottom="Made with ❤️ by Code Geass"
  /> </div>
				</div>
			</Router>
        );
	}
}

export default App;
