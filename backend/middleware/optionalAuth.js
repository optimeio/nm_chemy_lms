const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

module.exports = (req, res, next) => {
  const auth = req.headers.authorization || req.headers.Authorization;

  if (!auth || !auth.startsWith('Bearer ')) {
    req.userId = null;
    return next();
  }

  const token = auth.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    return next();
  } catch (err) {
    req.userId = null;
    return next();
  }
};
