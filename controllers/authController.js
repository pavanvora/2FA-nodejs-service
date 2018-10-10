const router = require('express').Router();
const authService = require('../services/authService');
const accountRepo = require('../repositories/accountRepo');
const CustomError = require('../errors/customError');
const authMiddleware = require('../middlewares/authMiddleware')

const bodyValidator = require('./../middlewares/bodyValidator');
const registerSchema = require('./../validators/account/userRegister');
const loginSchema = require('./../validators/account/userLogin');

router.post('/register', bodyValidator(registerSchema), async (req, res, next) => {
    const { password, ...user } = req.body;
    try {
        const passwordHash = await authService.generatePasswordHash(password);
        user.password = passwordHash;
        await accountRepo.storeUser(user);
    } catch (error) {
        next(error);
        return;
    }
    res.sendStatus(204)
});

router.post('/login', bodyValidator(loginSchema), async (req, res, next) => {
    const { email, password } = req.body;
    try {
        var user = await accountRepo.getUserLogin(email);
        if (!user) {
            throw new CustomError("Email validation failed!", 400);
        }
        const isPasswordMatch = await authService.verifyPasswordHash(password, user.password);
        if (!isPasswordMatch) {
            throw new CustomError("Password validation failed!", 400);
        }
    } catch (error) {
        next(error);
        return;
    }

    const tokenData = {
        id: user.id,
        email: user.email,
        mfa: {
            status: user.mfa.status,
            isVerified: false,
        },

    }
    const token = authService.generateToken(tokenData);
    res.send({ "AccessToken": token });
});

router.post('/mfa/verifyOTP', authMiddleware.verifyToken, async (req, res, next) => {
    const user = req.user;
    console.log('user: ', user);
    const otp = req.body.otp;
    console.log('otp: ', otp);
    try {
        const { mfa } = await accountRepo.getUserMFA(user.id);
        const isVerified = authService.verify2FACode(otp, mfa.secret);
        if(!isVerified) {
            throw new CustomError('Wrong OTP. Please try again', 403);
        }
    } catch (error) {
        next(error);
        return;
    }
    const tokenData = {
        id: user.id,
        email: user.email,
        mfa: {
            status: user.mfa.status,
            isVerified: true,
        },
    }
    const token = authService.generateToken(tokenData);
    res.send({ "AccessToken": token });
});

module.exports = router;