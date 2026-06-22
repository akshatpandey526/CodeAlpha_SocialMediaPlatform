const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto', // Detects whether image or video automatically
    });
    
    // Remove local file after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    
    return {
      url: response.secure_url,
      resource_type: response.resource_type // 'image' or 'video'
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    // Ensure cleanup of local file in case of failure
    if (localFilePath && fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        console.error('Failed to delete local temp file:', err);
      }
    }
    throw error;
  }
};

module.exports = { cloudinary, uploadToCloudinary };
