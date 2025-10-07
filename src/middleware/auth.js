const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/user.model');

async function authMiddleware(req, res, next){
  const auth = req.headers.authorization;
  if(!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try{
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.id).select('-password');
    if(!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = user;
    next();
  }catch(err){
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authMiddleware };
