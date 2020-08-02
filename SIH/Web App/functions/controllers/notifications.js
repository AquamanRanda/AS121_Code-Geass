var { admin, db } = require('../firebaseadmin');
const firebase = require('../firebaseConfig');

exports.markNotificationsRead = async (req, res) => {
	// code
	try {
		let batch = db.batch();
		let notificationsIds = req.body.notifications;
		notificationsIds.forEach((notifId) => {
			const notification = db.doc(`notification/${notifId}`);
			batch.update(notification, { read: true });
		});
		await batch.commit();
		return res.status(200).json({ message: 'notifications marked read' });
	} catch (err) {
		console.error(err);
		return res.status(400).json({ error: err.message });
	}
};
