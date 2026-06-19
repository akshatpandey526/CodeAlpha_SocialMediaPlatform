const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/users/search
// @desc    Search users by username
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.json([]);
    }

    const users = await User.find({
      username: { $regex: query, $options: 'i' }
    })
      .select('username profilePic bio followers')
      .limit(10);

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, search failed' });
  }
});

// @route   GET /api/users/suggestions
// @desc    Get recommended users to follow (users currently not followed)
// @access  Private
router.get('/suggestions', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    // Find users who are not the current user and not already in their following list
    const suggestions = await User.find({
      _id: { $ne: currentUser._id, $nin: currentUser.following }
    })
      .select('username profilePic bio')
      .limit(5);

    res.json(suggestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching suggestions' });
  }
});

// @route   GET /api/users/:username
// @desc    Get user profile details by username
// @access  Public
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('followers', 'username profilePic bio')
      .populate('following', 'username profilePic bio');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, profile lookup failed' });
  }
});

// @route   PUT /api/users/update
// @desc    Update bio, profile picture, and/or cover picture
// @access  Private
router.put(
  '/update',
  protect,
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'coverPic', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { bio } = req.body;
      const updateData = {};

      if (bio !== undefined) {
        updateData.bio = bio;
      }

      // Check uploaded files
      if (req.files) {
        if (req.files.profilePic && req.files.profilePic[0]) {
          updateData.profilePic = `/uploads/${req.files.profilePic[0].filename}`;
        }
        if (req.files.coverPic && req.files.coverPic[0]) {
          updateData.coverPic = `/uploads/${req.files.coverPic[0].filename}`;
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true }
      ).select('-password');

      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error, update failed', error: error.message });
    }
  }
);

// @route   PUT /api/users/:id/follow
// @desc    Follow/unfollow a user
// @access  Private
router.put('/:id/follow', protect, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User to follow not found' });
    }

    let isFollowing = false;

    if (currentUser.following.includes(targetUser._id)) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUser._id.toString()
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUser._id.toString()
      );
    } else {
      // Follow
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
      isFollowing = true;
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: isFollowing ? 'Successfully followed' : 'Successfully unfollowed',
      isFollowing,
      following: currentUser.following
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, follow toggle failed' });
  }
});

module.exports = router;
