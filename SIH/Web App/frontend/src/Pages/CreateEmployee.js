import React, { Component } from 'react';
import EditPane from '../Components/EditPane';
import axios from '../util/axiosinstance';

export class CreateEmployee extends Component {
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
			let resp = await axios.post(`/employees`, {
				...obj,
			});
			console.log(resp.data.id);
			let id = resp.data.id;
			this.props.history.push(`/cci/create/${obj['name']}/${id}`);
		} catch (err) {
			console.error(err);
		}
	};
	render() {
		return (
			<div>
				<h1>
					Create an Employee/Incharge profile before you create a CCI
				</h1>
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

export default CreateEmployee;
