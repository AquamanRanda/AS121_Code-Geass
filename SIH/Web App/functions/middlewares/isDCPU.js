const { db } = require('../firebaseadmin');

exports.isDCPU = async (req, res, next) => {
	if (req.user.role === 'DCPU' || req.user.role === 'ADMIN') {
		return next();
	} else {
		return res.status(403).json({ message: 'only DCPUs can create CCIs' });
	}
};

exports.isCorrectDCPU = async (req, res, next) => {
	let cciDistrict = req.body.district;

	if (req.user.role === 'ADMIN') {
		return next();
	}

	// get the dcpu district
	let doc = await db.doc(`dcpu/${req.user.organisation}`).get();

	if (!doc.exists) {
		return res.status(500).json({ error: 'the dcpu does not exist' });
	} else {
		let dcpuData = doc.data();
		if (dcpuData.district === cciDistrict) {
			req.dcpuData = dcpuData;
			return next();
		} else {
			return res.status(403).json({
				message: `you can only create CCI's in your own district : ${dcpuData.district}`,
			});
		}
	}
};
