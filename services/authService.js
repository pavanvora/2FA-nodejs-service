const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const config = require('./../config');

module.exports.generateToken = (data) => {
    const token = jwt.sign(data, config.auth.JWT_SECRET, {expiresIn: '1h'});
    return token;
}

module.exports.verifyToken = (token) => {
    const decoded = jwt.verify(token, config.auth.JWT_SECRET);
    return decoded;
}

module.exports.generatePasswordHash = async (password) => {
    const hash = await bcrypt.hash(password, 5);
    return hash;
}

module.exports.verifyPasswordHash = async (password, hash) => {
    const isEqual = await bcrypt.compare(password, hash);
    return isEqual;
}

module.exports.setup2FASecret = async (user) => {
    const options = {
        issuer: '2FA demo',
        name: `2FA demo (${ user.email })`,
        length: 64,
    }
    const {base32, otpauth_url} = speakeasy.generateSecret(options);
    const generateQR = await QRCode.toDataURL(otpauth_url);
    return {
        secret: base32,
        QRCodeURL: generateQR,
    }
}

module.exports.verify2FACode = (otp, secret) => {
    const isVerified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: otp,
    });
    return isVerified;
}