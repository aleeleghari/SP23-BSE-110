module.exports = function (req, res, next) {
    if (req.user && req.user.isAdmin) {
        return next();
    }
    res.redirect('/'); // Redirect to home if not an admin
};
