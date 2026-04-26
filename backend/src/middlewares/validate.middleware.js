const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/apiResponse');

const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((error) => ({
      field: error.path,
      message: error.msg
    }));

    return errorResponse(res, 'Validation failed', 400, formattedErrors);
  };
};

module.exports = validate;
