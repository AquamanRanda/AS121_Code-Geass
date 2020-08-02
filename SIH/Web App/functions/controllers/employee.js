var { admin, db } = require('../firebaseadmin');
const firebase = require('../firebaseConfig');
const { validationResult } = require('express-validator');
const fbconfig = require('../firebaseconfigjson');

exports.createEmployee = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).send(errors.array());
		}

		let org = req.user.organisation;
		let empData = req.body;
		empData['createdAt'] = new Date().toISOString();
		empData['createdBy'] = req.user.user_id;
		empData['createdByUser'] = req.user.email;
		// we have req.dcpuData
		let doc = await db.collection('employees').add(empData);
		// add the employee to dcpu

		// let x = await db.doc(`dcpu/${org}`).update({
		// 	employees: firebase.firestore.FieldValue.arrayUnion(doc.id),
		// });

		let x = await db.collection('dcpu').doc(org);
		x.update({
			employees: admin.firestore.FieldValue.arrayUnion(doc.id),
			employeeNames: admin.firestore.FieldValue.arrayUnion(req.body.name),
		});

		return res
			.status(201)
			.json({ message: 'employee created successfully', id: doc.id });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: 'an error occured' });
	}
};

exports.editEmployee = async (req, res) => {
	// edit employee
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).send(errors.array());
		}

		let id = req.params.id;
		let empData = req.body;
		empData['lastEditedAt'] = new Date().toISOString();
		empData['lastEditedBy'] = req.user.user_id;
		empData['lastEditedByUser'] = req.user.email;
		// id of the employee to update
		let doc = await db.doc(`employees/${id}`).update(empData);
		return res.status(200).json({ message: 'edited successfully' });
	} catch (err) {
		console.error(err);
		return res.status(400).json({ message: 'invalid id' });
	}
};

exports.getEmployee = async (req, res) => {
	try {
		// veerify if role  === cci, then they cant access some1 else's data

		let id = req.params.id;
		let empDoc = await db.collection('employees').doc(id).get();

		if (!empDoc.exists) {
			return res.status(400).json({ message: 'invalid id' });
		}
		let empData = empDoc.data();

		if (req.user.role === 'CCI') {
			if (empData.workingAt != req.user.organisation) {
				return res.status(403).json({
					error: 'you are not authorized to access this data',
				});
			}
		}
		return res.status(200).json(empData);
	} catch (err) {
		console.error(err);
		return res.status(400).json({ message: 'an error occured' });
	}
};

exports.uploadEmployeeFiles = async (req, res) => {
	const district = req.params.district;

	// get the dcpu district
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

			let writeResult = await db.doc(`employees/${id}`).update({
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
