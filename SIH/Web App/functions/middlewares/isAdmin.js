const isAdmin = (req, res, next) => {
	if (req.user.role === 'ADMIN') {
		return next();
	} else {
		return res
			.status(403)
			.json({ error: 'you are unauthorized to access this route' });
	}
};

module.exports = isAdmin;
