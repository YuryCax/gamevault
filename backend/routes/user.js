const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

/**
 * @swagger
 * /user/settings:
 *   get:
 *     summary: Get user settings
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 interactiveGuides:
 *                   type: boolean
 *                 language:
 *                   type: string
 *   put:
 *     summary: Update user settings
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               interactiveGuides:
 *                 type: boolean
 *               language:
 *                 type: string
 *     responses:
 *       200:
 *         description: Settings updated
 */
router.get('/settings', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json(user.settings);
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
});

router.put('/settings', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.settings = { ...user.settings, ...req.body };
    await user.save();
    res.status(200).json({ message: req.t('settings_updated') });
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
});

module.exports = router;