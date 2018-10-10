const authService = require('./../services/authService');
const CustomError = require('./../errors/customError');

const verifyToken = (req, res, next) => {
    const tokenId = req.get("Authorization");
    if (!tokenId) {
        const customError = new CustomError("Token not provided", 401);
        next(customError);
        return;
    }
    try {
        var verifiedToken = authService.verifyToken(tokenId);
    } catch (error) {
        next(error);
        return;
    }
    req.user = {
        id: verifiedToken.id,
        email: verifiedToken.email,
        mfa: verifiedToken.mfa,
    }
    next();
};

module.exports.verifyOTP = async (req, res, next) => {
    const tokenId = req.get("Authorization");
    try {
        var verifiedToken = authService.verifyToken(tokenId);
        if (verifiedToken.mfa.status == "ENABLE") {
            if (!verifiedToken.mfa.isVerified) {
                throw new CustomError("OTP not provided", 403);
            }
        }
    } catch (error) {
        next(error);
        return;
    }
    next();
}

module.exports.verifyToken = verifyToken;