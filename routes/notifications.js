const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const notes = await Notification.find({
      $or: [{ targetRole: 'all' }, { targetRole: req.user.role }]
    }).sort('-createdAt').limit(50);
    const unread = await Notification.countDocuments({ isRead: false, $or: [{ targetRole: 'all' }, { targetRole: req.user.role }] });
    res.json({ success: true, data: notes, unread });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All marked read' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id/read', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
