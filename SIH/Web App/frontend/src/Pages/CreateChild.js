import React, { Component } from 'react';
import EditPane from '../Components/EditPane';
import axios from '../util/axiosinstance';

export class CreateChild extends Component {
	onSubmitHandler = async (keys, values) => {
		console.log(keys, values);
		let obj = {};
		try {
			for (let id = 0; id < keys.length; id++) {
				const el = keys[id];
				if (el.trim() === '' || values[id].trim() === '') {
					continue;
				}
				obj[el] = values[id];
			}
			let resp = await axios.post(`/child`, {
				...obj,
			});
			console.log(resp.data.id);
			let id = resp.data.id;
			this.props.history.push(`/child/${id}`);
		} catch (err) {
			console.error(err);
		}
	};

	onCreateGuardianHandler = async (keys, values) => {
		// submit and move to the create guardian page
		let obj = {};

		try {
			for (let id = 0; id < keys.length; id++) {
				const el = keys[id];
				if (el.trim() === '' || values[id].trim() === '') {
					continue;
				}
				obj[el] = values[id];
			}
			let resp = await axios.post(`/child`, {
				...obj,
			});
			console.log(resp.data.id);
			let id = resp.data.id;
			// this.props.history.push(`/child/${id}`);
			// move to the guardian creation page
			this.props.history.push(`/child/${id}/guardian/create`);
		} catch (err) {
			console.error(err);
		}
	};

	render() {
		return (
			<div>
				<h1>Create a child</h1>
				<div>
					<EditPane
						defaults={true}
						defaultValues={['name', 'age', 'dob']}
						onCreateGuardianHandler={this.onCreateGuardianHandler}
						onSubmitHandler={this.onSubmitHandler}
						data={{}}
					/>
				</div>
			</div>
		);
	}
}

export default CreateChild;
