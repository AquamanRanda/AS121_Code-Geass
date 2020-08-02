var { admin, db } = require('../firebaseadmin');
const firebase = require('../firebaseConfig');

exports.getChildrenData = async (req, res) => {
	// code
	try {
		let cci = req.query.cci;
		if (!cci) {
			return res
				.status(400)
				.json({ error: 'cci must be passed as a query param' });
		}

		let result = [];
		// get the children who are in the particular cci
		let doc = await db.collection('children').where('cci', '==', cci).get();
		let data = doc.docs;
		data.forEach((child) => {
			let data = child.data();
			data['id'] = child.id;
			result.push(data);
		});
		return res.status(200).json({ result });
	} catch (err) {
		console.error(err);
		return res.status(400).json({ error: err.message });
	}
};

exports.uploadAttendance = async (req, res) => {
	//code
	/**
	 * req.body = {
	 *	attendance: [{id: String, attendance: "y" | "n", name: String , timestamp: String } ],
		cci: String
	 * }
	 */
	try {
		let data = req.body;
		let { cci } = req.body;

		let doc = await db
			.doc(`attendance/${cci}--${new Date().toISOString}`)
			.set(data);
		return res
			.status(201)
			.json({ message: 'attendance recorded successfully' });
	} catch (err) {
		console.error(err);
		return res.status(400).json({ error: err.message });
	}
};
