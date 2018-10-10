const User = require('./../models/user');

module.exports.storeUser = async (user) => {
    const newUser = new User(user);
    return await newUser.save();
};

module.exports.getUserLogin = async (email) => {
    const user = await User.findOne({ email });
    return user;
}

module.exports.getUserProfile = async (userId) => {
    const user = await User.findById(userId)
        .select({
            firstName: 1,
            lastName: 1,
            email: 1,
        });
    return user;
}

module.exports.setupMFA = async (userId, secret) => {
    await User.findByIdAndUpdate(userId, {
        "mfa.status": "CREATED",
        "mfa.secret": secret,
    });
}

module.exports.updateMFA = async (userId, status) => {
    await User.findByIdAndUpdate(userId, {
        "mfa.status": status,
    });
}

module.exports.getUserMFA = async (userId) => {
    const mfa = await User.findById(userId)
        .select('mfa');
    return mfa;
}