var { admin, db } = require('../firebaseadmin');
const firebase = require('../firebaseConfig');

exports.getDCPUs = async (req, res) => {
	let district = req.params.district;
	// we have the district

	// populate => cci, employees,

	try {
		let final = [];

		let docs = await db
			.collection('dcpu')
			.where('district', '==', district)
			.get();
		if (docs.empty) {
			return res.status(400).json({ message: 'no DCPU found' });
		}

		let allData = docs.docs;

		// populate CCIs

		for (let result of allData) {
			if (result.exists) {
				let data = result.data();
				let ccis = {};
				console.log('ccis: before:  ', ccis);

				for (let cciId of data.ccis) {
					let cciDoc = await db.collection('cci').doc(cciId).get();
					if (cciDoc.exists) {
						ccis[cciId] = { ...cciDoc.data() };
					}
				}
				data['ccis'] = ccis;

				// populate employees
				let emps = {};
				for (let empId of data.employees) {
					let empDoc = await db
						.collection('employees')
						.doc(empId)
						.get();
					if (empDoc.exists) {
						emps[empId] = { ...empDoc.data() };
					}
				}
				data['employees'] = emps;

				// populate inCharge
				let inCharge = data.inCharge;
				if (inCharge) {
					let empDoc = await db
						.collection('employees')
						.doc(inCharge)
						.get();
					if (empDoc.exists) {
						data['inChargeData'] = { ...empDoc.data() };
					}
				}

				console.log(data);
				final.push(data);
			}
		}

		// allData.forEach(async (result) => {

		// });

		console.log(final);

		return res.status(200).json(final);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message });
	}
};