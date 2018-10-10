const router = require('express').Router();
const accountRepo = require('../repositories/accountRepo');
const authService = require('../services/authService');
const CustomError = require('../errors/customError');

router.get('/profile', async (req, res, next) => {
    const userId = req.user.id;
    try {
        var user = await accountRepo.getUserProfile(userId);
    } catch (error) {
        next(error);
        return;
    }
    res.send(user);
});

router.get('/mfa/setup', async (req, res, next) => {
    const user = req.user;
    try {
        var { secret, QRCodeURL } = await authService.setup2FASecret(user);
        await accountRepo.setupMFA(user.id, secret);
    } catch (error) {
        next(error);
        return;
    }
    res.send({ QRCodeURL });
});

router.post('/mfa/enable', async (req, res, next) => {
    const user = req.user;
    const otp = req.body.otp;
    try {
        const { mfa: { secret } } = await accountRepo.getUserLogin(user.email);
        const isVerified = authService.verify2FACode(otp, secret);
        if(isVerified) {
            await accountRepo.updateMFA(user.id, "ENABLE");
        } else {
            throw new CustomError("Wrong OTP please try again or regenerate the QRCode");
        }
    } catch (error) {
        next(error);
        return;
    }
    res.sendStatus(204);
});

module.exports = router;