const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');
const { validationResult } = require('express-validator');

class AuthController {
  async register(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation failed', 400, errors.array());

    const data = await authService.register(req.body);
    return sendSuccess(res, data, 'Registration successful. Please verify your email.', 201);
  }

  async login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation failed', 400, errors.array());

    const data = await authService.login(req.body);
    return sendSuccess(res, data, 'Login successful');
  }

  async refreshToken(req, res) {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendError(res, 'Refresh token required', 400);

    const tokens = await authService.refreshTokens(refreshToken);
    return sendSuccess(res, tokens, 'Tokens refreshed');
  }

  async verifyEmail(req, res) {
    const { token } = req.params;
    await authService.verifyEmail(token);
    return sendSuccess(res, null, 'Email verified successfully');
  }

  async forgotPassword(req, res) {
    await authService.forgotPassword(req.body.email);
    return sendSuccess(res, null, 'Password reset email sent');
  }

  async resetPassword(req, res) {
    const { token } = req.params;
    const { password } = req.body;
    await authService.resetPassword(token, password);
    return sendSuccess(res, null, 'Password reset successful');
  }

  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    return sendSuccess(res, null, 'Password changed successfully');
  }

  async getMe(req, res) {
    const { password, refreshToken, ...user } = req.user;
    return sendSuccess(res, user, 'Profile fetched');
  }

  async logout(req, res) {
    await authService.logout(req.user.id);
    return sendSuccess(res, null, 'Logged out successfully');
  }
}

module.exports = new AuthController();
