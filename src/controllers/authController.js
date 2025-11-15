const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthController {
  // Google OAuth callback
  static async googleCallback(req, res) {
    try {
      const user = req.user;

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // In production, redirect to frontend with token
      res.json({
        success: true,
        message: 'Authentication successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Authentication failed',
        error: error.message
      });
    }
  }

  // Get current user
  static async getCurrentUser(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'email', 'name', 'avatar', 'created_at']
      });

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
        error: error.message
      });
    }
  }

  // Logout
  static async logout(req, res) {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Logout failed'
        });
      }
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    });
  }
}

module.exports = AuthController;
