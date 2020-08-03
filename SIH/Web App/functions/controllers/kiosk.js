var { admin, db } = require('../firebaseadmin');
const firebase = require('../firebaseConfig');

exports.postCCIRating = async (req, res) => {
	// code
	let { rating, cci } = req.body;

	try {
		let cciDoc = await db.doc(`cci/${cci}`).get();
		if (!cciDoc.exists) {
			return res.status(400).json({ error: 'invalid cci id' });
		}
		let score = 0;
		let cciData = cciDoc.data();
		if (cciData.feedback) {
			cciData.feedback.push(rating);
			total = 0;
			for (const el of cciData.feedback) {
				total += el;
			}
			console.log(total);
			score = total / cciData.feedback.length;
			score = score.toFixed(1);
		} else {
			score: rating;
		}

		console.log(score);
		let x = await db.doc(`cci/${cci}`).update({
			score: score.toString(),
			feedback: admin.firestore.FieldValue.arrayUnion(rating),
		});
		return res
			.status(200)
			.json({ message: 'feedback recorded successfully' });
	} catch (err) {
		console.error(err);
		return res.status(400).json({ error: err.message });
	}
};

exports.postReview = async (req, res) => {
	//cdode
	let { review, childId } = req.body;

	try {
		let doc = await db
			.doc(`children/${childId}`)
			.update({ reviews: admin.firestore.FieldValue.arrayUnion(review) });
		return res.status(200).json({ message: 'review successfully added' });
	} catch (err) {
		console.error(err);
		return res.status(400).json({ error: err.message });
	}
};

exports.postTextToSpeech = async (req, res) => {
	let { review, cci } = req.body;

	try {
		let doc = await db
			.doc(`cci/${cci}`)
			.update({ reviews: admin.firestore.FieldValue.arrayUnion(review) });
		return res.status(200).json({ message: 'review successfully added' });
	} catch (err) {
		console.error(err);
		return res.status(400).json({ error: err.message });
	}
};
