var { admin, db } = require('../firebaseadmin');
const firebase = require('../firebaseConfig');

exports.sendMessage = async (req, res) => {
	// send a message
	// req.body = {sender: req.user, receiver: }

	try {
		let { receiver, message } = req.body;

		let createdAt = new Date().toISOString();
		let sender = req.user.organisation;

		let resp = await db
			.collection(`message`)
			.add({ receiver, createdAt, sender, message });
		return res.status(201).json({ message: 'message created' });
	} catch (err) {
		console.error(err);
		return res.status(400).json({ error: err.message });
	}
};

exports.getMessages = async (req, res) => {
	// req.body = {
	// user1: adqds,
	// user2: sadiasd
	// }

	try {
		let { user1, user2 } = req.query;

		// check user1 to user2
		// and the check user2 to user1

		let x = db
			.collection('message')
			.where('sender', '==', user1)
			.where('receiver', '==', user2)
			.orderBy('createdAt', 'desc');
		let doc1 = await x.get();
		let user1to2 = doc1.docs;
		let user1to2data = [];

		let y = db
			.collection('message')
			.where('sender', '==', user2)
			.where('receiver', '==', user1)
			.orderBy('createdAt', 'desc');
		let doc2 = await y.get();
		let user2to1 = doc2.docs;

		let final = [];

		let i = 0;
		let j = 0;
		while (true) {
			if (user1to2[i] && user2to1[j]) {
				let d1 = user1to2[i].data();
				let d2 = user2to1[j].data();
				let time1 = new Date(d1.createdAt);
				let time2 = new Date(d2.createdAt);
				if (time1 >= time2) {
					final.push(d1);
					i++;
				} else {
					final.push(d2);
					j++;
				}
			} else if (!user1to2[i] && user2to1[j]) {
				let d2 = user2to1[j].data();
				final.push(d2);
				j++;
			} else if (!user2to1[j] && user1to2[i]) {
				let d1 = user1to2[i].data();
				final.push(d1);
				i++;
			} else {
				break;
			}
		}

		return res.status(200).json({ final });
	} catch (err) {
		console.error(err);
		return res.status(400).json({ error: err.message });
	}
};
