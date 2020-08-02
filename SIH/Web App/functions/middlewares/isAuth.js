const { admin } = require('../firebaseadmin');
const firebase = require('../firebaseConfig');

const isAuth = async (req, res, next) => {
	try {
		let token;
		if (req.headers.authorization) {
			token = req.headers.authorization.split('Bearer ')[1];
		} else {
			console.error('no header found');
			return res.status(401).json({ error: 'unauthorized' });
		}

		let decodedToken = await admin.auth().verifyIdToken(token);
		// let x = await firebase.auth().signInWithCustomToken(token);
		req.user = decodedToken;

		return next();
	} catch (err) {
		console.error(err);
		return res
			.status(401)
			.json({ error: 'error verifying token', err: err });
	}
};

module.exports = isAuth;
