import React, { Component } from 'react';
import Axios from '../util/axiosinstance';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link } from 'react-router-dom';
import '../styles/home.css';
import BellIcon from 'react-bell-icon';

export class Home extends Component {
	state = {
		data: null,
		bell: false,
		open: false,
	};

	componentDidMount() {
		document.addEventListener('mousedown', this.handleClickOutside);
	}
	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutside);
	}

	onClickChildrenData = async () => {
		try {
			let resp = await Axios.get('/child/notplaced', {
				params: { district: this.props.district },
			});
			this.setState({
				childrenNotPlaced: resp.data,
				showChildrenNotPlaced: true,
			});
			console.log(resp);
		} catch (err) {
			console.log(err.response);
		}
	};

	componentDidMount = async () => {
		try {
			let resp = await Axios.get(
				`/${this.props.role}/${this.props.organisation}`
			);
			console.log(resp);
			this.setState({ data: resp.data });
			let printableData = {};
			for (const key in resp.data) {
				if (resp.data.hasOwnProperty(key)) {
					const value = resp.data[key];
					if (key === 'notifications') {
						continue;
					} else {
						printableData[key] = value;
					}
				}
			}
			this.setState({ printableData });
		} catch (err) {
			console.error(err);
		}
	};

	handleButtonClick = () => {
		this.setState((state) => {
			return {
				open: !state.open,
			};
		});
	};

	onClickPOData = async () => {
		try {
			let resp = await Axios.get(`/po?district=${this.props.district}`);
			console.log(resp);
			this.setState({ POData: resp.data, showPO: true });
		} catch (err) {
			console.error(err);
		}
	};

	onClickDCPUData = async () => {
		try {
			let resp = await Axios.get(`/dcpu?district=${this.props.district}`);
			console.log(resp);
			this.setState({ DCPUData: resp.data, showDCPU: true });
		} catch (err) {
			console.error(err);
		}
	};

	// formatDCPUData = () => {
	// 	return (
	// 		<div>

	// 		</div>
	// 	)
	// };

	isDate = function (date) {
		date = date.toString();

		if (
			date.match(
				/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/g
			)
		) {
			return true;
		} else {
			return false;
		}
		// return new Date(date) !== 'Invalid Date' && !isNaN(new Date(date));
	};

	showChildData = () => {
		return this.state.childData.map((el) => {
			let pic = '';
			if (el.photo) {
				pic = el.photo;
			} else {
				pic =
					'data:image/jpeg;base64,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';
			}
			return (
				<div className="text-center flex justify-center pt-4">
                    <div className="border-2 border-black">
					<Link to={`/child/${el.id}`}>
						<img  width="150" height="50" src={pic} alt='' />
						name: {el.name}
					</Link>
				</div></div>
			);
		});
	};

	showChildrenHandler = async () => {
		// do the req

		try {
			let resp = await Axios.get(`/cci/children`, {
				// params: { cci: 'chineakdjsn-asn' },
				params: { cci: this.props.organisation },
			});
			if (resp.data.result.length <= 0) {
				this.setState({
					error: 'The CCI does not have any children at the moment',
				});
			} else {
				this.setState({
					childData: resp.data.result,
					cciShowChildData: true,
				});
			}
			console.log(resp);
		} catch (err) {
			console.log(err.response);
		}
	};

	formatData = () => {
		let x = [];
		for (const key in this.state.printableData) {
			let value = this.state.printableData[key];
			if (key === 'inChargeName') {
				x.push(
					<Link 
						to={`/employee/${this.state.printableData['inCharge']}`}>
						<p className="pb-4"><strong>{key}  : {value}</strong></p>
					</Link>
				);
			} else if (key === 'inCharge') {
				continue;
			} else if (key === 'photo') {
				x.push(<img src={value} />);
			} else if (this.isDate(value)) {
				x.push(
					<p className="pb-4">
						<strong>{key}</strong> : {dayjs(value).fromNow()}
					</p>
				);
			} else {
				x.push(
					<p className="pb-4">
						<strong>{key}</strong> : {value}
					</p>
				);
			}
		}

		return <div className="border-2 border-black bg-blue-400">{x}</div>;
	};

	handleClickOutside = (event) => {
		if (
			this.container.current &&
			!this.container.current.contains(event.target)
		) {
			this.setState({
				open: false,
			});
		}
	};

	fullAccessMarkUp = (role) => {
		return (
			<div>
				<div className='text-center  '>
					<div className='block my-2'>
						<button
							className=' w-64 text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-2 bg-blue-500 active:bg-blue-600 uppercase text-sm shadow hover:shadow-lg'
							disabled={this.state.showCCIs}
							onClick={() => this.setState({ showCCIs: true })}>
							CCIs under your jurisdiction
						</button>
					</div>
					{this.state.showCCIs &&
						this.state.data.ccis.map((el) => {
							return (
								<div>
									<Link to={`/cci/${el}`}>{el}</Link>
								</div>
							);
						})}

					<div className='block my-2'>
						<button
							className=' w-64 text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-2 bg-blue-500 active:bg-blue-600 uppercase text-sm shadow hover:shadow-lg'
							disabled={this.state.showPO}
							onClick={this.onClickPOData}>
							POs under your jurisdiction
						</button>
					</div>
					{this.state.showPO && (
						<div>
							{this.state.POData.po.map((el) => {
								return (
									<div>
										<Link to={`/po/${el.id}`}>
											{el.name}
										</Link>
									</div>
								);
							})}
						</div>
					)}
					<div className='block my-2'>
						<button
							className='w-64 text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-2 bg-blue-500 active:bg-blue-600 uppercase text-sm shadow hover:shadow-lg'
							disabled={this.state.showDCPU}
							onClick={this.onClickDCPUData}>
							DCPUs under your jurisdiction
						</button>
					</div>
					{this.state.showDCPU && (
						<div>
							{/* {this.formatDCPUData()} */}
							{this.state.DCPUData.map((el) => {
								return (
									<div>
										<Link to={`/dcpu/${el.id}`}>
											{el.id}
										</Link>
									</div>
								);
							})}
						</div>
					)}
					<button className='w-64 text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-2 bg-blue-500 active:bg-blue-600 uppercase text-sm shadow hover:shadow-lg'>
						{' '}
						<Link to={'/child/create'}>Create a Child Profile</Link>
					</button>

					{this.props.role === 'DCPU' && (
						<div className='my-2'>
							<button className=' w-64 text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-2 bg-blue-500 active:bg-blue-600 uppercase text-sm shadow hover:shadow-lg'>
								<Link to='/employee/create'>Create a CCI</Link>
							</button>
						</div>
					)}

					<button
						className=' w-64 text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-2 bg-blue-500 active:bg-blue-600 uppercase text-sm shadow hover:shadow-lg'
						disabled={this.state.showChildren}
						onClick={this.onClickChildrenData}>
						Show Children who are not placed in any CCI yet
					</button>
                    {this.state.showChildrenNotPlaced && (
                        <div>
                            {this.state.childrenNotPlaced.final.map((el) => {
                                return (
                                    <div>
                                        <Link to={`/child/${el.id}`}>
                                            {el.name}
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
				</div>
			</div>
		);
	};
	partialAccessMarkUp = () => {
		return (
			<div className="text-center pt-4">
				<div className="">{this.state.data && this.formatData()}</div>
				{this.state.error && <p>{this.state.error}</p>}
                <div className="pt-4">
				<button className="pt-4 text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-1 bg-gray-800 active:bg-gray-700 uppercase text-sm shadow hover:shadow-lg"
					disabled={this.state.cciShowChildData}
					onClick={this.showChildrenHandler}>
					Show Children in your care
				</button></div>
				{this.state.childData && this.showChildData()}
			</div>
		);
	};

	render() {
		dayjs.extend(relativeTime);
		let fullaccessRoles = ['DCPU', 'CWC', 'PO'];
		console.log(this.props);
		return (
			<div>
				<div className='container' ref={this.state.open}>
					<button
						type='button'
						class='button'
						onClick={this.handleButtonClick}>
                        <div className="pl-2 pt-6">
						<BellIcon
							className='bell'
							width='40'
							active={true}
							animate={this.setState.bell}
						/> </div>
					</button>
					{this.state.open && (
						<div class='bg-blue-500 dropdown'>
							<ul>
								{this.state.data.notifications.map(
									(notification) => {
										if (notification.message) {
											return (
                                                <ol type="1">    
                                                <li><Link to={notification.link}>
													{notification.message}
												</Link></li>
                                                </ol>
											);
										} else {
											return null;
										}
									}
								)}
							</ul>
						</div>
					)}
				</div>

				<div className='text-2xl text-center mb-2 '>
					Welcome to Eudaemon
				</div>

				<div className='text-2xl text-center mb-2'>
					This is your {this.props.organisation} Dashboard
				</div>
				{/* <button onClick={this.showNotificationHandler}>
					Notifications
				</button> */}
				{this.state.data && fullaccessRoles.includes(this.props.role)
					? this.fullAccessMarkUp()
					: this.partialAccessMarkUp()}
			</div>
		);
	}
}

export default Home;
