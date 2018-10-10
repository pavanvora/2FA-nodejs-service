const mongoose = require('mongoose');
const CustomError = require('./../errors/customError');

const mfaSchema = mongoose.Schema({
    status: {
        type: String,
        default: "DISABLE",
        enum: ["CREATED", "ENABLE", "DISABLE"],
    },
    secret: {
        type: String,
        default: null
    },
}, {
        timestamps: true,
    });

const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    mfa: { type: mfaSchema, default: mfaSchema },
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

userSchema.pre('save', async function (next) {
    const user = await User.findOne({ email: this.email });
    if (user) {
        const customError = new CustomError(`User already exist with email: ${this.email}`, 400);
        next(customError);
    }
    return;
});

module.exports = User;