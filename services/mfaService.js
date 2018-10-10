const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

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