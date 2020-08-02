const isNotCCI = (req, res, next) => {
	// write the code
	let allowedRoles = ['CWC', 'PO', 'DCPU', 'ADMIN'];
	if (!allowedRoles.includes(req.user.role)) {
		return res.status(403).json({
			message:
				'unauthorised request. You do not have access to this data',
		});
	} else return next();
};

module.exports = isNotCCI;
