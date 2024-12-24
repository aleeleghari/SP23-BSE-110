// middleware/auth.js
module.exports = {
    isAdmin: (req, res, next) => {
        if (req.isAuthenticated() && req.user.role === 'admin') {
            return next();  // Admin user, proceed to next middleware/route
        }
        res.redirect('/');  // Redirect non-admin to home page
    },
    isUser: (req, res, next) => {
        if (req.isAuthenticated() && req.user.role === 'user') {
            return next();  // Regular user, proceed to next middleware/route
        }
        res.redirect('/login');  // Redirect to login if not authenticated or not a user
    }
};
