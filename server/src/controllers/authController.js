import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { get, run } from '../config/db.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';

// 1. Sign Up / Register
export async function register(req, res) {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists. Please log in.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = run(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name.trim(), normalizedEmail, passwordHash]
    );

    const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: result.lastInsertRowid,
        name: name.trim(),
        email: normalizedEmail,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
}

// 2. Login
export async function login(req, res) {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = get('SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?', [normalizedEmail]);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const expiresIn = rememberMe ? '30d' : '24h';
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn });

    return res.json({
      success: true,
      message: 'Welcome back to Shivaayaha Silk Sarees!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
}

// 3. Forgot Password (generate time-bound code)
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = get('SELECT id, name FROM users WHERE email = ?', [normalizedEmail]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found with that email address.' });
    }

    // Generate 6-digit numeric reset token valid for 15 minutes
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    run('UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?', [
      resetCode,
      expiresAt,
      user.id,
    ]);

    console.log(`\n========================================`);
    console.log(`[PASSWORD RESET CODE for ${normalizedEmail}]: ${resetCode}`);
    console.log(`Expires at: ${expiresAt}`);
    console.log(`========================================\n`);

    return res.json({
      success: true,
      message: 'Password reset verification code generated. Valid for 15 minutes.',
      resetCode, // Return in response for quick manual copy/testing in the UI
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Server error generating reset code.' });
  }
}

// 4. Reset Password
export async function resetPassword(req, res) {
  try {
    const { email, resetCode, newPassword, confirmPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, reset code, and new password are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = get(
      'SELECT id, reset_token, reset_token_expires_at FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (!user || user.reset_token !== String(resetCode).trim()) {
      return res.status(400).json({ success: false, message: 'Invalid verification reset code.' });
    }

    if (new Date(user.reset_token_expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Reset code has expired. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    run(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?',
      [passwordHash, user.id]
    );

    return res.json({
      success: true,
      message: 'Password successfully reset! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Server error resetting password.' });
  }
}

// 5. Get Current User Session
export async function getMe(req, res) {
  return res.json({
    success: true,
    user: req.user,
  });
}
