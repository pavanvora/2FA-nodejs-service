const Joi = require('joi');

const authSchema = Joi.object({
    JWT_SECRET: Joi.string().required(),
});

const { error, value: envVars } = Joi.validate(process.env, authSchema, { stripUnknown: true });

if (error) {
    const err = error.details[0].message;
    console.log(err);
    throw new Error(err);
}

module.exports = envVars;