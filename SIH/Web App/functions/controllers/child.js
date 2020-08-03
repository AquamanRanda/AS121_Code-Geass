var { admin, db } = require('../firebaseadmin');
const firebase = require('../firebaseConfig');
const { validationResult } = require('express-validator');

exports.createChild = async (req, res) => {
	// user is verified

	try {
		console.log('consoling : ', req.user);
		childData = req.body;

		// route should not be accessible to role="CCI"

		if (req.user.role === 'CCI') {
			return res.status(401).json({ error: 'unauthorized user' });
		}

		// user is not CCI
		childData['createdAt'] = new Date().toISOString();
		childData['createdByUser'] = req.user.email;
		// childData['createdBy'] = req.user.user_id;
		// create entry in db
		let doc = await db.collection('children').add(childData);
		// created successfully
		return res.status(201).json({
			message: `child with id : ${doc.id} created successfully`,
			id: doc.id,
		});
	} catch (err) {
		console.error(err);
		return res
			.status(500)
			.json({ error: 'something went wrong', err: err });
	}
};

exports.updateChild = async (req, res) => {
	// authenticated user
	try {
		id = req.params.id;
		let childData = req.body;
		if (req.user.role === 'CCI') {
			return res.status(403).json({ error: 'unauthorized user' });
		}
		childData['lastEditedByUser'] = req.user.email;
		// childData['lastEditedBy'] = req.user.user_id;
		childData['lastEditedAt'] = new Date().toISOString();

		let doc = await db.doc(`children/${id}`).get();

		if (!doc.exists) {
			return res.status(400).json({ error: 'invalid id' });
		} else {
			// document exists
			let x = await db
				.doc(`children/${id}`)
				.set(childData, { merge: true });
			return res
				.status(200)
				.json({ message: 'document updated successfully' });
		}
	} catch (err) {
		console.error(err);
	}
};

exports.getChild = async (req, res) => {
	// we have the child's data in req.childData
	try {
		if (!req.childData) {
			let doc = await db.doc(`children/${req.params.id}`).get();
			if (!doc.exists) {
				// invalid id i guess
				return res
					.status(400)
					.json({ message: 'document does not exist. wrong id' });
			} else {
				// doc exists
				let docData = doc.data();
				req.childData = docData;
				return res.status(200).json(req.childData);
			}
		}
	} catch (err) {
		console.error(err);
		return res.status(400).json({ error: err.message });
	}

	// try {
	// 	if (req.childData.guardian) {
	// 		// populate guardian
	// 		let guardianDoc = await db
	// 			.collection('guardians')
	// 			.doc(req.childData.guardian)
	// 			.get();
	// 		if (!guardianDoc.exists)
	// 			return res.status(200).json({
	// 				error: 'guardian data does not exist',
	// 				childData: req.childData,
	// 			});
	// 		let guardianData = guardianDoc.data();
	// 		req.childData['guardian'] = guardianData;
	// 		return res.status(200).json(req.childData);
	// 	} else {
	// 		return res.status(200).json(req.childData);
	// 	}
	// } catch (err) {
	// 	console.error(err);
	// 	return res.status(400).json({ error: err.message });
	// }
};

exports.getNotPlacedChildren = async (req, res) => {
	// get the children not in any cci yet

	try {
		console.log('in the aosid');
		let district = req.query.district;
		let doc = await db
			.collection('children')
			.where('district', '==', district)
			.get();
		let docs = doc.docs;
		let final = [];
		docs.forEach((childDoc) => {
			let childData = childDoc.data();
			if (!childData['cci']) {
				childData['id'] = childDoc.id;
				final.push(childData);
			}
		});
		return res.status(200).json({ final });
	} catch (err) {
		console.error(err);
		return res.status(400).json({ error: err.message });
	}
};
