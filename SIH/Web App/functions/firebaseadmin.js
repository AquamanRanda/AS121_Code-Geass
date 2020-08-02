var admin = require('firebase-admin');
var serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://eudaemon-20a5e.firebaseio.com',
});

console.log('i ran');

const db = admin.firestore();

module.exports = { admin, db };
