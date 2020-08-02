var { admin, db } = require('../firebaseadmin');
const firebase = require('../firebaseConfig');

const { validationResult } = require('express-validator');

// req.body = {
//     district: String,
//     cciName: String,
//     cwc: String,
//     classification: "GOVT" | "NGO",
//     inChargeName: String,
//     inCharge: String,
//     state: String,
// }
exports.createCCI = async (req, res) => {
	// req.user req.dcpuData
	// we have the dcpu data

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).send(errors.array());
	}

	try {
		let cciName = req.body.cciName;
		// let doc = await db.doc(`cci/${cciName}`).
		let doc = await db.collection('cci').listDocuments();
		if (doc.includes(cciName)) {
			// CCI already exists
			return res.status(400).json({
				error: ` A CCI with the name ${cciName} already exists `,
			});
		} else {
			// create the entry

			// before creating, validate the inCharge

			let inCharge = req.body.inCharge;
			let empDoc = await db.doc(`employees/${inCharge}`).get();
			if (!empDoc.exists) {
				return res
					.status(400)
					.json({ error: 'employee does not exist' });
			}

			let dataToAdd = { ...req.body };
			dataToAdd['createdAt'] = new Date().toISOString();
			dataToAdd['createdBy'] = req.user.user_id;
			dataToAdd['createdByUser'] = req.user.email;
			let cwc = req.body.cwc;
			let dcpu = req.body.dcpu;

			// have to check cwc and dcpu values are correct or not

			// let cwcQuery = await db
			// 	.collection('cwc')
			// 	.where('district', '==', req.body.district)
			// 	.get();

			let dcpuQuery = await db
				.collection('dcpu')
				.where('district', '==', req.body.district)
				.get();
			let dcpuDocs = dcpuQuery.docs;
			// let cwcDocs = cwcQuery.docs;
			// console.log('dcpu : ', dcpuDocs[0].id);
			let dcpulist = [];
			// let cwclist = [];
			// cwcDocs.forEach((el) => cwclist.push(el.id));
			dcpuDocs.forEach((el) => dcpulist.push(el.id));
			console.log(dcpulist);
			if (
				// !cwclist.includes(cwc) ||
				!dcpulist.includes(dcpu)
			) {
				return res
					.status(400)
					.json({ error: 'wrong/invalid cwc/dcpu' });
			} else {
				// get the cci array and then update

				// let cwcdoc = await db
				// 	.collection('cwc')
				// 	.doc(cwc)
				// 	.update({
				// 		ccis: admin.firestore.FieldValue.arrayUnion(cciName),
				// 	});

				let dcpudoc = await db
					.collection('dcpu')
					.doc(dcpu)
					.update({
						ccis: admin.firestore.FieldValue.arrayUnion(cciName),
					});

				// update employee
				let empdoc = await db
					.collection('employees')
					.doc(inCharge)
					.update({
						workingAt: cciName,
						// addedBy: req.user.user_id,
						addedByUser: req.user.email,
					});
			}

			let ref = await db.doc(`cci/${cciName}`).set(dataToAdd);
			return res.status(201).json({
				message: `cci with name : ${cciName} created successfully`,
				id: cciName,
			});
		}
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message });
	}
};

exports.editCCI = async (req, res) => {
	// edit a cci
	try {
		let id = req.params.id;
		// id of the cci
		let data = req.body;
		data['lastEditedBy'] = req.user.user_id;
		data['lastEditedByUser'] = req.user.email;
		data['lastEditedAt'] = new Date().toISOString();

		let doc = await db.doc(`/cci/${id}`).update(data);
		return res.status(200).json({ message: 'CCI edited successfully' });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message });
	}
};

exports.getCCI = async (req, res) => {
	let id = req.params.id;
	// id is the id of the CCI
	let organisation = req.user.organisation;
	let role = req.user.role;

	if (role === 'CCI') {
		if (organisation != id) {
			return res.status(403).json({
				error: 'unauthorized. You can only view your own data',
			});
		}
	}

	let doc = await db.doc(`cci/${id}`).get();
	if (!doc.exists) {
		return res
			.status(400)
			.json({ error: 'invalid id or document does not exist ' });
	}
	let data = doc.data();

	if (organisation === id) {
		// same user
		// extract notifications and send

		let notificationDoc = await db
			.collection('notification')
			.where('recipients', 'array-contains', id)
			.orderBy('createdAt', 'desc')
			.get();
		let notifications = [];
		let notificationData = notificationDoc.docs;
		for (const notif of notificationData) {
			let x = notif.data();
			x['id'] = notif.id;
			notifications.push({ ...x });
		}
		data['notifications'] = notifications;
	}
	return res.status(200).json(data);
};

exports.getChildrenInCCI = async (req, res) => {
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

exports.uploadCCIFiles = async (req, res) => {
	//code
	const district = req.params.district;

	let doc = await db.doc(`dcpu/${req.user.organisation}`).get();

	if (!doc.exists) {
		return res.status(500).json({ error: 'the dcpu does not exist' });
	} else {
		let dcpuData = doc.data();
		if (dcpuData.district === cciDistrict) {
			req.dcpuData = dcpuData;
		} else {
			return res.status(403).json({
				message: `you can only create CCI's in your own district : ${dcpuData.district}`,
			});
		}
	}

	const id = req.params.id;
	const type = req.params.type;

	const BusBoy = require('busboy');
	const path = require('path');
	const os = require('os');
	const fs = require('fs');

	const busboy = new BusBoy({ headers: req.headers });

	let fileName;
	let fileToBeUploaded = {};

	busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
		console.log(fieldname);
		console.log(filename);
		console.log(mimetype);

		const extension = filename.split('.')[filename.split('.').length - 1];
		fileName = `${Math.round(Math.random() * 10000000000)}.${extension}`;
		const filePath = path.join(os.tmpdir(), fileName);
		fileToBeUploaded = { filePath, mimetype };

		file.pipe(fs.createWriteStream(filePath));
	});

	busboy.on('finish', async () => {
		try {
			let x = await admin
				.storage()
				.bucket(fbconfig.storageBucket)
				.upload(fileToBeUploaded.filePath, {
					resumable: false,
					metadata: {
						metadata: {
							contentType: fileToBeUploaded.mimetype,
						},
					},
				});
			const fileurl = `https://firebasestorage.googleapis.com/v0/b/${fbconfig.storageBucket}/o/${fileName}?alt=media`;

			let a = `${type}UploadedByUser`;
			let y = `${type}UploadedBy`;

			let writeResult = await db.doc(`cci/${id}`).update({
				[type]: fileUrl,
				[a]: req.user.email,
				[y]: req.user.user_id,
			});

			return res.status(201).json({
				message: `${type} uploaded at ${fileurl} successfully `,
			});
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: err.code });
		}
	});
	busboy.end(req.rawBody);
};
