var { admin, db } = require('../firebaseadmin');
const firebase = require('../firebaseConfig');
const { validationResult } = require('express-validator');

exports.createGuardian = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).send(errors.array());
	}
	// create a guardian
	let childId = req.params.id;
	console.log(childId);
	let doc;
	let guardianData = req.body;
	try {
		let org = req.user.organisation;
		guardianData['createdAt'] = new Date().toISOString();
		guardianData['createdBy'] = req.user.user_id;
		guardianData['createdByUser'] = req.user.email;

		doc = await db.collection('guardians').add(guardianData);
		// update in the child's data
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: 'an error occurred' });
	}

	let childData = {};
	childData['lastEditedByUser'] = req.user.email;
	childData['lastEditedBy'] = req.user.user_id;
	childData['lastEditedAt'] = new Date().toISOString();

	try {
		let x = await db.doc(`children/${childId}`).update({
			guardian: doc.id,
			guardianName: guardianData['name'],
			...childData,
		});
		return res
			.status(201)
			.json({ message: 'guardian successfully created', id: childId });
	} catch (err) {
		console.error(err);
		return res.status(400).json({ error: 'invalid child ID' });
	}
};

exports.updateGuardian = async (req, res) => {
	let id = req.params.id;
	// guardian id
	let guardianData = req.body;
	if (req.user.role === 'CCI') {
		return res.status(403).json({ error: 'unauthorized user' });
	}
	guardianData['lastEditedByUser'] = req.user.email;
	guardianData['lastEditedBy'] = req.user.user_id;
	guardianData['lastEditedAt'] = new Date().toISOString();

	try {
		let doc = db.collection('guardians').doc(id).update(guardianData);
		return res
			.status(200)
			.json({ message: 'document updated successfully' });
	} catch (error) {
		console.error(err);
		return res.status(400).json({ error: 'invalid child ID' });
	}
};

exports.getGuardian = async (req, res) => {
	try {
		console.log('im running');
		let id = req.params.id;
		let doc = await db.doc(`guardians/${id}`).get();
		// if(!doc.exists){
		// 	return res.status(400).json({})
		// }
		let data = doc.data();
		console.log(data);
		return res.status(200).json(data);
	} catch (err) {
		console.error(err);
		return res.status(400).json({ error: err.message });
	}
};
