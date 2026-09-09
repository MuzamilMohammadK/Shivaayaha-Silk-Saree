import jwt from 'jsonwebtoken';
import { get } from '../config/db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'shivaayaha_silk_sarees_super_secret_jwt_key_2026';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Session expired or invalid token. Please log in again.' });
    }

    const user = get('SELECT id, name, email, created_at FROM users WHERE id = ?', [decoded.userId]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    req.user = user;
    next();
  });
}
