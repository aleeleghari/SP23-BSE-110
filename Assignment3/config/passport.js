const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports = function (passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) return done(null, false, { message: 'No user found' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return done(null, false, { message: 'Incorrect password' });

            return done(null, user);  // Pass the user object to the session
        } catch (error) {
            return done(error);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);  // Store the user ID in the session
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);  // Retrieve the user using the ID stored in session
            done(null, user);  // Attach the user object to `req.user`
        } catch (error) {
            done(error, null);
        }
    });
};
