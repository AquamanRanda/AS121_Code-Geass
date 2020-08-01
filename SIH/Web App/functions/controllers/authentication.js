var { admin, db } = require('../firebaseadmin');
const firebase = require('../firebaseConfig');

const { validationResult } = require('express-validator');

exports.getLogin = async (req, res) => {
	try {
		let result = {};

		let district = req.query.district;

		if (!district) {
			return res
				.status(400)
				.json({ error: 'must a district query param' });
		}

		// PO
		let pos = await db
			.collection('po')
			.where('district', '==', district)
			.get();

		let poData = pos.docs;
		let POs = [];
		for (const PO of poData) {
			console.log(PO.data());
			let data = PO.data();
			data['id'] = PO.id;
			POs.push(data);
		}
		result['PO'] = POs;

		// CWC
		let cwcs = await db
			.collection('cwc')
			.where('district', '==', district)
			.get();
		let cwcData = cwcs.docs;
		let CWCs = [];
		for (const cwc of cwcData) {
			let data = cwc.data();
			data['id'] = cwc.id;
			console.log(cwc.data());
			CWCs.push(data);
		}
		result['CWC'] = CWCs;

		// DCPU
		let dcpus = await db
			.collection('dcpu')
			.where('district', '==', district)
			.get();
		let dcpuData = dcpus.docs;
		let DCPUs = [];
		for (const dcpu of dcpuData) {
			console.log(dcpu.data());
			let data = dcpu.data();
			data['id'] = dcpu.id;
			DCPUs.push(data);
		}
		result['DCPU'] = DCPUs;

		// CCI
		let ccis = await db
			.collection('cci')
			.where('district', '==', district)
			.get();
		let cciData = ccis.docs;
		let CCIs = [];
		for (const cci of cciData) {
			console.log(cci.data());
			let data = cci.data();
			data['id'] = cci.id;
			CCIs.push(data);
		}
		result['CCI'] = CCIs;

		// let cwc = await db.collection('/cwc').listDocuments();
		// let values = [];
		// cwc.forEach((el) => {
		// 	values.push(el.id);
		// });
		// result['cwc'] = values;

		// let cci = await db.collection('/cci').listDocuments();
		// values = [];
		// cci.forEach((el) => values.push(el.id));
		// result['cci'] = values;

		// let dcpu = await db.collection('/dcpu').listDocuments();
		// values = [];
		// dcpu.forEach((el) => values.push(el.id));
		// result['dcpu'] = values;

		return res.status(200).json(result);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message });
	}
};

exports.postSignup = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).send(errors.array());
	}

	let availableRoles = ['CCI', 'CWC', 'DCPU', 'PO'];

	if (!availableRoles.includes(req.body.role)) {
		return res.status(400).json({ error: 'invalid role' });
	}

	try {
		const newUser = {
			email: req.body.email,
			role: req.body.role,
			organisation: req.body.organisation,
		};

		let data = await firebase
			.auth()
			.createUserWithEmailAndPassword(newUser.email, req.body.password);

		await admin.auth().setCustomUserClaims(data.user.uid, {
			role: newUser.role,
			organisation: newUser.organisation,
		});

		// TRYING CUSTOM TOKEN
		// const newToken = await admin.auth().createCustomToken(data.user.uid, {
		// 	role: newUser.role,
		// 	organisation: newUser.organisation,
		// });

		newUser['createdAt'] = new Date().toISOString();
		newUser['uid'] = data.user.uid;
		await db.doc(`users/${newUser['uid']}`).set(newUser);

		// let token = await data.user.getIdToken();

		let data1 = await firebase
			.auth()
			.signInWithEmailAndPassword(newUser.email, req.body.password);

		return res.status(201).json({
			message: `user ${data.user.uid} created`,
			token: await data1.user.getIdToken(),
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message });
	}
};

exports.postLogin = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).send(errors.array());
	}

	let role = req.body.role;

	let availableRoles = ['CCI', 'CWC', 'DCPU', 'PO', 'ADMIN'];

	if (!availableRoles.includes(req.body.role)) {
		return res.status(400).json({ error: 'invalid role' });
	}

	if (role === 'ADMIN') {
		try {
			const user = {
				email: req.body.email,
				password: req.body.password,
			};
			let data = await firebase
				.auth()
				.signInWithEmailAndPassword(user.email, user.password);
			let token = await data.user.getIdToken();
			return res.status(200).json({ token: token });
		} catch (err) {
			console.error(err);
			return res.status(400).json({ error: err.message });
		}
	}

	try {
		const user = {
			email: req.body.email,
			password: req.body.password,
		};
		let roleLower = req.body.role.toLowerCase();
		let organisation = req.body.organisation;

		// before auth - check if organisation is correct
		let listDocs = await db.collection(roleLower).listDocuments();
		let q = [];
		listDocs.forEach((e) => q.push(e.id));
		console.log(q);
		if (!q.includes(organisation)) {
			return res.status(400).json({ error: 'invalid organisation' });
		}

		let data = await firebase
			.auth()
			.signInWithEmailAndPassword(user.email, user.password);
		console.log(data.user.uid);
		// have to check if the roles are same
		let doc = await db.doc(`users/${data.user.uid}`).get();
		if (!doc.exists) {
			return res.status(400).json({ error: 'error occurred' });
		}

		console.log(doc.data());
		collection = doc.data();

		if (
			collection.role === role &&
			collection.organisation === organisation
		) {
			// correct - generate custom token and return
			// let customToken = await admin
			// 	.auth()
			// 	.createCustomToken(data.user.uid, {
			// 		role: role,
			// 		organisation: organisation,
			// 	});
			let token = await data.user.getIdToken();
			return res.status(200).json({ token: token });
		} else {
			return res
				.status(400)
				.json({ error: 'invalid/wrong role or organisation' });
		}
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
};
