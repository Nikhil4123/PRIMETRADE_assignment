const { errorResponse } = require('../utils/apiResponse');

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    if (req.user.role !== role) {
      return errorResponse(res, 'Forbidden: insufficient permissions', 403);
    }

    return next();
  };
};

module.exports = requireRole;
