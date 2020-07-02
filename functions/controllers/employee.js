var { admin, db } = require('../firebaseadmin');
const firebase = require('../firebaseConfig');

exports.createEmployee = async (req, res) => {
	try {
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
		});

		return res
			.status(201)
			.json({ message: 'employee created successfully' });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: 'an error occured' });
	}
};

exports.editEmployee = async (req, res) => {
	// edit employee
	try {
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
