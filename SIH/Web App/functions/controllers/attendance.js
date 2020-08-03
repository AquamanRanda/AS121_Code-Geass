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
		cci: String,
		date: String
	 * }
	 */
	try {
		let data = req.body;
		let { cci } = req.body;

		let doc = await db.doc(`attendance/${cci}--${req.body.date}`).set(data);
		return res
			.status(201)
			.json({ message: 'attendance recorded successfully' });
	} catch (err) {
		console.error(err);
		return res.status(400).json({ error: err.message });
	}
};

exports.postGuardianVisit = async (req, res) => {
	//req.body = {
	// 	childId: child id,
	// 	date:  ISOString,
	// 	guardianId: String,
	// 	guardianName: String,
	// 	startTime: ISOString,
	// 	stopTime: ISOString,
	//	cci: cciName
	// }

	try {
		let data = req.body;
		let resp = await db.collection('visits').add(data);
		let guardian = await db
			.doc(`guardians/${data.guardianId}`)
			.update({ lastVisited: req.body.startTime });
		return res.status(201).json({ message: 'visit recorded successfully' });
	} catch (err) {
		console.error(err);
		return res.status(400).json({ error: err.message });
	}
};

exports.getVisits = async (req, res) => {
	let cci = req.query.cci;
	// api.comasdqd/api/attendance/guardians?cci=chennai-cci1
	try {
		let x = await db.collection('visits').where('cci', '==', cci).get();
		let docs = x.docs;
		let final = [];
		for (const visitDoc of docs) {
			let visit = visitDoc.data();
			final.push(visit);
		}
		return res.status(200).json({ data: final });
	} catch (err) {
		console.error(err);
		return res.status(400).json({ error: err.message });
	}
};
