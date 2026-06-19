const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    let imageUrl = '';

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    if (!text && !imageUrl) {
      return res.status(400).json({ message: 'Post content cannot be empty' });
    }

    const newPost = await Post.create({
      user: req.user._id,
      text: text || '',
      image: imageUrl
    });

    const populatedPost = await Post.findById(newPost._id).populate(
      'user',
      'username profilePic bio'
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, post creation failed', error: error.message });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post successfully deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, delete failed' });
  }
});

// @route   GET /api/posts/feed
// @desc    Get user feed (posts from followed accounts + self)
// @access  Private
router.get('/feed', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const followingIds = currentUser.following;

    // Timeline includes posts by current user and people they follow
    const posts = await Post.find({
      user: { $in: [...followingIds, req.user._id] }
    })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePic bio')
      .populate('comments.user', 'username profilePic');

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error loading feed' });
  }
});

// @route   GET /api/posts/explore
// @desc    Get global explore posts
// @access  Public
router.get('/explore', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePic bio')
      .populate('comments.user', 'username profilePic');

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error loading explore feed' });
  }
});

// @route   GET /api/posts/user/:username
// @desc    Get posts by a specific user
// @access  Public
router.get('/user/:username', async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ user: targetUser._id })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePic bio')
      .populate('comments.user', 'username profilePic');

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error loading user posts' });
  }
});

// @route   PUT /api/posts/:id/like
// @desc    Like or unlike a post
// @access  Private
router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    let isLiked = false;

    if (post.likes.includes(req.user._id)) {
      // Unlike post
      post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      // Like post
      post.likes.push(req.user._id);
      isLiked = true;
    }

    await post.save();
    res.json({ likesCount: post.likes.length, isLiked, likes: post.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error liking/unliking post' });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
// @access  Private
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment content cannot be empty' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      user: req.user._id,
      username: req.user.username,
      profilePic: req.user.profilePic || '',
      text: text.trim()
    };

    post.comments.push(newComment);
    await post.save();

    // Re-query to return full list populated nicely
    const updatedPost = await Post.findById(post._id)
      .populate('user', 'username profilePic bio')
      .populate('comments.user', 'username profilePic');

    res.status(201).json(updatedPost.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error posting comment' });
  }
});

module.exports = router;
