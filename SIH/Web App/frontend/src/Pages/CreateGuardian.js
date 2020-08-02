import React, { Component } from 'react';
import EditPane from '../Components/EditPane';
import axios from '../util/axiosinstance';

export class CreateGuardian extends Component {
	onSubmitHandler = async (keys, values) => {
		let obj = {};
		try {
			for (let id = 0; id < keys.length; id++) {
				const el = keys[id];
				if (el.trim() === '' || values[id].trim() === '') {
					continue;
				}
				obj[el] = values[id];
			}
			// obj['childId'] = this.props.match.params.id;
			let resp = await axios.post(
				`/guardian/${this.props.match.params.id}`,
				{
					...obj,
				}
			);
			console.log(resp.data.id);
			let id = resp.data.id;
			this.props.history.push(`/child/${id}`);
		} catch (err) {
			console.error(err.response.data);
		}
	};

	render() {
		return (
			<div>
				<h1>Create a Guardian Profile</h1>
				<div>
					<div>
						<EditPane
							onSubmitHandler={this.onSubmitHandler}
							data={{}}
						/>
					</div>
				</div>
			</div>
		);
	}
}

export default CreateGuardian;
