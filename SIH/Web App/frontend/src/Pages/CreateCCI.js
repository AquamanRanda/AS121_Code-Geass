import React, { Component } from 'react';
import EditPane from '../Components/EditPane';
import axios from '../util/axiosinstance';

export class CreateCCI extends Component {
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

			let { empname, empid } = this.props.match.params;
			obj['inChargeName'] = empname;
			obj['inCharge'] = empid;
			obj['dcpu'] = this.props.organisation;

			let resp = await axios.post(`/cci`, {
				...obj,
			});
			console.log(resp.data.id);
			let id = resp.data.id;
			this.props.history.push(`/cci/${resp.data.id}`);
		} catch (err) {
			console.error(err);
		}
	};
	render() {
		return (
			<div>
				<h1>Create a CCI </h1>
				<div>
					<EditPane
						onCreateGuardianHandler={this.onCreateGuardianHandler}
						onSubmitHandler={this.onSubmitHandler}
						data={{}}
					/>
				</div>
			</div>
		);
	}
}

export default CreateCCI;
