import React, { Component } from 'react';
import Axios from '../util/axiosinstance';
import { Link } from 'react-router-dom';

export class Home extends Component {
	state = { data: null };

	componentDidMount = async () => {
		try {
			let resp = await Axios.get(
				`/${this.props.role}/${this.props.organisation}`
			);
			console.log(resp);
			this.setState({ data: resp.data });
		} catch (err) {
			console.error(err);
		}
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

	onClickChildrenData = async () => {
		try {
			let resp = await Axios.get(
				`/child/notplaced?district=${this.props.district}`
			);
			console.log(resp);
			this.setState({
				childrenData: resp.data.final,
				showChildren: true,
			});
		} catch (err) {
			console.error(err);
		}
	};

	formatDCPUData = () => {};

	fullAccessMarkUp = (role) => {
		return (
			<div>
				<div>
					<button
						disabled={this.state.showCCIs}
						onClick={() => this.setState({ showCCIs: true })}>
						CCIs under your jurisdiction
					</button>

					{this.state.showCCIs &&
						this.state.data.ccis.map((el) => {
							return (
								<div>
									<Link to={`/cci/${el}`}>{el}</Link>
								</div>
							);
						})}

					<button
						disabled={this.state.showPO}
						onClick={this.onClickPOData}>
						POs under your jurisdiction
					</button>
					{this.state.showPO && (
						<div>
							{this.state.POData.po.map((el) => {
								return (
									<Link to={`/po/${el.id}`}>{el.name}</Link>
								);
							})}
						</div>
					)}
					<button
						disabled={this.state.showDCPU}
						onClick={this.onClickDCPUData}>
						DCPUs under your jurisdiction
					</button>
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
					<Link to={'/child/create'}>Create a Child Profile</Link>
					{this.props.role === 'DCPU' && (
						<div>
							<Link to='/employee/create'>Create a CCI</Link>
						</div>
					)}

					<button
						disabled={this.state.showChildren}
						onClick={this.onClickChildrenData}>
						Show Children who are not placed in any CCI yet
					</button>
					{this.state.showChildren && (
						<div>
							{this.state.childrenData.map((el) => {
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
	partialAccessMarkUp = () => {};

	render() {
		let fullaccessRoles = ['DCPU', 'CWC', 'PO'];
		console.log(this.props);
		return (
			<div>
				<h1>Welcome to Eudaemon</h1>
				<h1>This is your {this.props.organisation} Dashboard</h1>
				{this.state.data && fullaccessRoles.includes(this.props.role)
					? this.fullAccessMarkUp(this.props.role)
					: this.partialAccessMarkUp()}
				what do we show here
			</div>
		);
	}
}

export default Home;
