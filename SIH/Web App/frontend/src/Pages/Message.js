import React, { Component } from 'react';
import axios from '../util/axiosinstance';
import { Redirect } from 'react-router-dom';

export class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			district: '',
			loading: false,
			error: null,
			email: '',
			password: '',
			organisation: '',
			role: 'DCPU',
			hideButton: false,
			mesEnter: '',
			message: [],
		};

		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit = async (event) => {
		console.log(this.state.mesEnter);
		console.log(this.state.organisation);
		try {
			if (this.state.mesEnter !== '') {
				let response = await axios.post('/message', {
					receiver: this.state.organisation,
					message: this.state.mesEnter,
				});
				console.log(response.data);
			}
			event.preventDefault();
		} catch (err) {
			console.log(err.response);
		}
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

	componentDidMount = () => {
		this.onDistrictLookUpHandler();
	};

	onDistrictLookUpHandler = async () => {
		// search for the district
		let { district } = this.state;
		try {
			this.setState({ loading: true });
			let resp = await axios.get('/login', {
				params: { district: this.props.district },
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
					hideButton: true,
					loading: false,
					error: null,
					data: data,
					value: '',
					organisation: data['DCPU'][0].id,
				});
			}
		} catch (err) {
			console.error(err);
			this.setState({ error: err.message });
		}
	};

	fetchMessage = async () => {
		let response = await axios.get('/message', {
			params: {
				user1: this.props.organisation,
				user2: this.state.organisation,
			},
		});
		console.log(response.data);

		this.setState((state) => ({
			message: response.data.final,
		}));
	};

	render() {
		let mesList = this.state.message.map((mess1) => {
			let x = '';
			if (mess1.sender === this.props.organisation) {
				x =
					' p-2 my-2 rounded text-white flex-row-reverse ';
			} else {
				x =
					' p-2 my-2 rounded text-white text-right  ';
			}

			return (
                <div className="bg-blue-500 border-2 border-black">
				<div style={{ alignContent: 'left' }} className={x}>
					<div >
						<strong className="text-black">{mess1.sender}</strong> :{mess1.message}{' '}
					</div>
				</div></div>
			);
		});

		return (
			<div>
				<br />

				{/* <button onClick={this.onDistrictLookUpHandler}>
					Enter Message
				</button> */}

				{this.state.data && (
					<div>
						<div className='center py-2'>
							<label className='pr-4' htmlFor='role'>
								Select your role
							</label>
							<select
								className='border-2'
								value={this.state.role}
								onChange={this.onSelectInputHandler}
								name='role'
								id='role'>
								<option value='DCPU'>DCPU</option>
								<option value='CCI'>CCI</option>
								<option value='CWC'>CWC</option>
								<option value='PO'>PO</option>
							</select>{' '}
						</div>

						<div className='center py-2'>
							<label className='pr-4' htmlFor='organisation'>
								Choose the name of your Organisation
							</label>
							<select
								className='border-2'
								value={this.state.organisation}
								onChange={this.onInputChangeHandler}
								name='organisation'
								id='organisation'>
								{this.state.data
									? this.state.data[this.state.role].map(
											(el) => {
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
											}
									  )
									: null}
							</select>
						</div>
						<br />
						<div className='center'>
							<textarea
								className='border-2 ml-2'
								rows='10'
								cols='50'
								id='mesEnter'
								name='mesEnter'
								onChange={this.onInputChangeHandler}
								value={this.state.mesEnter}
								type='text'
							/>
						</div>
						<br />
						<div className='center py-2'>
							<button
								className='text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-2 bg-blue-500 active:bg-blue-600 uppercase text-sm shadow hover:shadow-lg'
								onClick={this.handleSubmit}>
								submit message
							</button>
						</div>
						<br />
						<div className='center'>
							<button
								className=' text-center text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-2 bg-blue-500 active:bg-blue-600 uppercase text-sm shadow hover:shadow-lg'
								onClick={this.fetchMessage}>
								Fetch Message
							</button>
						</div>
						<div
							className='flex flex-col'
							// className='text-center '
						>
							{mesList}
						</div>
					</div>
				)}
			</div>
		);
	}
}

export default App;
