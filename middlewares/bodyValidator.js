const Joi = require('joi');
const CustomError = require('./../errors/customError');

module.exports = (schema) => {
    return (req, res, next) => {
        const { error, value } = Joi.validate(req.body, schema);
        if (error) {
            const customError = new CustomError(error.details[0].message);
            next(customError);
            return;
        } else {
            req.body = value;
            next();
        }

    }
}