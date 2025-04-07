const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        hasAvatar: user.avatar ? true : false
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    // Fields to update
    const fieldsToUpdate = {
      fullName: req.body.fullName,
      phone: req.body.phone,
      address: req.body.address,
      email: req.body.email
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        hasAvatar: user.avatar ? true : false
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update user avatar
// @route   PUT /api/profile/avatar
// @access  Private
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({
        success: false,
        error: 'Please upload an image file'
      });
    }

    console.log(`Received file: ${req.file.originalname}, type: ${req.file.mimetype}, size: ${req.file.size} bytes`);
    
    const user = await User.findById(req.user.id);

    if (!user) {
      console.log(`User not found: ${req.user.id}`);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update avatar in database
    user.avatar = req.file.buffer;
    user.avatar.contentType = req.file.mimetype;
    await user.save();
    
    console.log(`Avatar updated for user: ${user._id}, content type: ${req.file.mimetype}`);

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully'
    });
  } catch (err) {
    console.error(`Error updating avatar: ${err.message}`);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get user avatar
// @route   GET /api/profile/avatar
// @access  Private
exports.getAvatar = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    console.log(`Getting avatar for user: ${userId}`);
    
    const user = await User.findById(userId);

    if (!user) {
      console.log(`User not found: ${userId}`);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.avatar || !user.avatar.contentType) {
      console.log(`Avatar not found for user: ${userId}`);
      return res.status(404).json({
        success: false,
        error: 'Avatar not found'
      });
    }

    console.log(`Sending avatar with content type: ${user.avatar.contentType}`);
    res.set('Content-Type', user.avatar.contentType);
    // Add cache control headers to prevent caching issues
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.send(user.avatar);
  } catch (err) {
    console.error(`Error getting avatar: ${err.message}`);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}; 