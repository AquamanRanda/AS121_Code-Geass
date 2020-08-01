var { admin, db } = require('../firebaseadmin');
const firebase = require('../firebaseConfig');
const fbconfig = require('../firebaseconfigjson');

exports.uploadFiles = async (req, res) => {
	const id = req.params.id;
	const type = req.params.type;

	let availableTypes = ['sir', 'photo', 'medrep', 'parentletter', 'icp'];
	if (!availableTypes.includes(type)) {
		return res.status(400).json({ error: 'invalid type/bad request' });
	}

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

			if (type === 'sir') {
				let writeResult = await db.doc(`children/${id}`).update({
					SIR: fileurl,
					SIRUploadedByUser: req.user.email,
					SIRUploadedBy: req.user.user_id,
				});
				return res.status(201).json({
					message: `SIR uploaded at ${fileurl} successfully`,
				});
				//	let availableTypes = ['sir', 'photo', 'medrep', 'parentletter', 'icp'];
			} else if (type === 'photo') {
				let writeResult = await db.doc(`children/${id}`).update({
					photo: fileurl,
					photoUploadedByUser: req.user.email,
					photoUploadedBy: req.user.user_id,
				});
				return res.status(201).json({
					message: `Photo uploaded at ${fileurl} successfully`,
				});
			} else if (type === 'medrep') {
				let writeResult = await db.doc(`children/${id}`).update({
					medrep: fileurl,
					medrepUploadedByUser: req.user.email,
					medrepUploadedBy: req.user.user_id,
				});
				return res.status(201).json({
					message: ` Medical Report uploaded at ${fileurl} successfully`,
				});
			} else if (type === 'parentletter') {
				let writeResult = await db.doc(`children/${id}`).update({
					parentLetter: fileurl,
					parentLetterUploadedByUser: req.user.email,
					parentLetterUploadedBy: req.user.user_id,
				});
				return res.status(201).json({
					message: ` Parent Letter uploaded at ${fileurl} successfully`,
				});
			} else if (type === 'icp') {
				let writeResult = await db.doc(`children/${id}`).update({
					ICP: fileurl,
					ICPUploadedByUser: req.user.email,
					ICPUploadedBy: req.user.user_id,
				});
				return res.status(201).json({
					message: `ICP uploaded at ${fileurl} successfully`,
				});
			} else {
				return res
					.status(400)
					.json({ error: 'invalid type/bad request' });
			}
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: err.code });
		}
	});
	busboy.end(req.rawBody);
};
