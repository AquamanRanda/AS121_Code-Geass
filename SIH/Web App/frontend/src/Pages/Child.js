import React, { Component } from 'react';
import axios from '../util/axiosinstance';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link } from 'react-router-dom';

export class Child extends Component {
	state = { data: null, fileType: 'SIR' };

	fetchData = async () => {
		try {
			let id = this.props.match.params.id;
			let resp = await axios.get(`/child/${id}`);
			console.log(resp);
			this.setState({ data: resp.data });
		} catch (err) {
			console.error(err);
		}
	};

	componentDidMount = async () => {
		//do the async
		this.fetchData();
	};

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

	formatData = () => {
		let x = [];
		if (Object.keys(this.state.data).includes('photo')) {
			x.push(<img src={this.state.data['photo']} />);
		} else {
			x.push(
				<img
					src={
						'data:image/jpeg;base64,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'
					}
				/>
			);
		}
		for (const key in this.state.data) {
			let value = this.state.data[key];
			if (this.isDate(value)) {
				// it is a date
				// format it
				x.push(
					<p>
						{key} : {dayjs(value).fromNow()}
					</p>
				);
			} else if (key === 'photo') {
				continue;
			} else if (key === 'guardianName') {
				x.push(
					<Link to={`/guardian/${this.state.data['guardian']}`}>
						{key}: {value}
					</Link>
				);
			} else {
				x.push(
					<p>
						{key} : {value}
					</p>
				);
			}
		}

		return <div>{x}</div>;
	};

	onFileUploadSelectHandler = (event) => {
		let fileType = event.target.value;
		this.setState({ fileType });
	};

	handleFileUpload = async (event) => {
		try {
			const filename = event.target.files[0];

			const formData = new FormData();
			formData.append('file', filename, filename.name);
			let resp = await axios.post(
				`/child/${this.props.match.params.id}/upload/${this.state.fileType}`,
				formData
			);
			this.fetchData();
			// this.props.history.push(`/child/${this.props.match.params.id}`);
		} catch (err) {
			console.log(err);
		}
	};

	render() {
		dayjs.extend(relativeTime);
		return (
			<div>
				<div>{this.state.data && this.formatData()}</div>

				{this.state.error && <p>{this.state.error}</p>}
				{this.props.role !== 'CCI' && (
					<div>
						<Link to={`/child/${this.props.match.params.id}/edit`}>
							Edit Child
						</Link>
						<div>
							<label htmlFor='fileType'>
								<select
									value={this.state.fileType}
									onChange={this.onFileUploadSelectHandler}
									name='fileType'
									id='fileType'>
									<option value='SIR'>SIR</option>
									<option value='medrep'>
										Medical Report
									</option>
									<option value='photo'>Photo</option>
									<option value='icp'>ICP</option>
									<option value='parentletter'>
										Parent Letter
									</option>
								</select>
							</label>

							<input
								type='file'
								id=''
								onChange={this.handleFileUpload}
							/>
						</div>
					</div>
				)}
			</div>
		);
	}
}

export default Child;
