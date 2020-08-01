var { admin, db } = require('../firebaseadmin');
const firebase = require('../firebaseConfig');

const { validationResult } = require('express-validator');

exports.getPO = async (req, res) => {
	// get a particular PO

	let id = req.params.id;
	try {
		let doc = await db.doc(`po/${id}`).get();
		if (!doc.exists) {
			return res.status(400).json({ error: 'Invalid ID' });
		}

		let data = doc.data();

		if (req.user.organisation === id) {
			// get notifications for the guy
			let notificationDoc = await db
				.collection('notification')
				.where('recipients', 'array-contains', id)
				.orderBy('createdAt', 'desc')
				.get();
			let notifications = [];
			let notificationData = notificationDoc.docs;
			for (const notif of notificationData) {
				let x = { ...notif.data() };
				x['id'] = notif.id;
				notifications.push({ ...x });
			}
			data['notifications'] = notifications;
		}
		return res.status(200).json(data);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message });
	}
};

exports.createPO = async (req, res) => {
	// create a PO
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).send(errors.array());
	}

	let name = req.body.name;

	try {
		let poData = req.body;
		poData['createdAt'] = new Date().toISOString();

		let doc = await db.collection('po').add(poData);
		return res
			.status(201)
			.json({ message: `PO with id: ${doc.id} created successfully` });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message });
	}
};

exports.editPO = async (req, res) => {
	// edit PO
	try {
		let id = req.params.id;
		let poData = req.body;
		poData['lastEditedAt'] = new Date().toISOString();

		let doc = await db.doc(`/po/${id}`).update(poData);
		return res.status(200).json({ message: 'PO edited successfully' });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message });
	}
};

exports.deletePO = async (req, res) => {
	try {
		let id = req.params.id;
		let doc = await db.doc(`/po/${id}`).delete();
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message });
	}
};

exports.getPOs = async (req, res) => {
	try {
		let district = req.query.district;

		if (!district) {
			return res
				.status(400)
				.json({ error: 'must a district query param' });
		}

		let doc = await db
			.collection('po')
			.where('district', '==', district)
			.get();

		if (doc.empty) {
			return res.status(400).json({ error: 'No PO found' });
		}
		let poData = doc.docs;
		let POs = [];
		for (const PO of poData) {
			console.log(PO.data());
			let data = PO.data();
			data['id'] = PO.id;
			POs.push(data);
		}
		return res.status(200).json({ po: POs });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message });
	}
};
