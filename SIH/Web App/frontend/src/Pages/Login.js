import React, { Component } from 'react';
import axios from '../util/axiosinstance';
import { Redirect } from 'react-router-dom';
import Axios from 'axios';

export class Login extends Component {
	state = {
		district: '',
		loading: false,
		error: null,
		email: '',
		password: '',
		organisation: '',
		role: 'DCPU',
	};

	componentDidMount = () => {
		// initial get route
		// let resp = await axios.get('/login');
	};

	onInputChangeHandler = (event) => {
		let value = event.target.value;
		let name = event.target.name;
		this.setState({ [name]: value });
	};

	onSelectInputHandler = (event) => {
		let name = event.target.name;
		// this.setState({ [name]: value });
		let role = event.target.value;

		this.setState((st) => {
			return { ...st, role, organisation: st.data[role][0].id };
		});
	};

	onDistrictLookUpHandler = async () => {
		// search for the district
		let { district } = this.state;
		try {
			this.setState({ loading: true });
			let resp = await axios.get('/login', {
				params: { district: district },
			});
			// console.log(resp);

			let data = resp.data;
			console.log(data);
			if (data['CWC'].length <= 0) {
				this.setState({
					error: 'Invalid District. Try again',
					loading: false,
				});
			} else {
				console.log(data['DCPU']);
				this.setState({
					loading: false,
					error: null,
					data: data,
					organisation: data['DCPU'][0].id,
				});
			}
		} catch (err) {
			console.error(err);
			this.setState({ error: err.message });
		}
	};

	onLoginSubmitHandler = async (e) => {
		// do the post request
		try {
			e.preventDefault();
			let { email, password, organisation, role } = this.state;
			const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if (
				email === '' ||
				password === '' ||
				organisation === '' ||
				role === ''
			) {
				this.setState({ error: "Values can't be left Blank" });
			} else if (!re.test(String(email).toLowerCase())) {
				this.setState({ error: 'Provide a valid E-mail' });
			} else {
				// send the request
				this.setState({ loading: true });

				let resp = await axios.post('/login', {
					email,
					password,
					organisation,
					role,
				});
				console.log(resp.data);
				let token = resp.data.token;
				localStorage.setItem('token', `Bearer ${token}`);
				localStorage.setItem('role', role);
				localStorage.setItem('organisation', organisation);
				localStorage.setItem('district', this.state.district);
				axios.defaults.headers['Authorization'] = `Bearer ${token}`;
				this.props.setUserDataPostLogin(
					role,
					token,
					organisation,
					this.state.district
				);
				this.setState({ loading: false, error: null }, () => {
					// this.props.history.push(`/${role}`);
					this.props.history.push(`/`);
				});
			}
		} catch (err) {
			console.log(err.response);
			if (err.response.data[0]) {
				this.setState({
					error: err.response.data[0].msg,
					loading: false,
				});
			} else if (err.response.data.error) {
				this.setState({
					error: err.response.data.error,
					loading: false,
				});
			}
		}
	};

	render() {
		if (this.props.authenticated) {
			return <Redirect to={'/'} />;
		}
		return (
			<div>
				<h1>LOGIN PAGE</h1>
				<label htmlFor='district'>Enter District :</label>

				<input
					id='district'
					name='district'
					onChange={this.onInputChangeHandler}
					value={this.state.district}
					type='text'
				/>
				<button onClick={this.onDistrictLookUpHandler}>Submit</button>
				{this.state.error ? <p>{this.state.error}</p> : null}
				{this.state.loading ? <p>Loading...</p> : null}
				{/* role, organisation, email, password */}

				{this.state.data && (
					<form action=''>
						<label htmlFor='email'>Email : </label>
						<input
							id='email'
							name='email'
							onChange={this.onInputChangeHandler}
							type='email'
						/>
						<label htmlFor='email'>Password : </label>
						<input
							id='password'
							name='password'
							onChange={this.onInputChangeHandler}
							type='password'
						/>
						<label htmlFor='role'>Select your role</label>
						<select
							value={this.state.role}
							onChange={this.onSelectInputHandler}
							name='role'
							id='role'>
							<option value='DCPU'>DCPU</option>
							<option value='CCI'>CCI</option>
							<option value='CWC'>CWC</option>
							<option value='PO'>PO</option>
						</select>
						<label htmlFor='organisation'>
							Choose the name of your Organisation
						</label>
						<select
							value={this.state.organisation}
							onChange={this.onInputChangeHandler}
							name='organisation'
							id='organisation'>
							{this.state.data
								? this.state.data[this.state.role].map((el) => {
										if (this.state.role === 'PO') {
											return (
												<option value={el.id}>
													{el.name}
												</option>
											);
										}
										return (
											<option value={el.id}>
												{el.id}
											</option>
										);
								  })
								: null}
						</select>

						<button
							onClick={this.onLoginSubmitHandler}
							type='submit'>
							submit
						</button>
					</form>
				)}
			</div>
		);
	}
}

export default Login;
