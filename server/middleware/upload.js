const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Initialize local disk storage for fallback
const localUploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, localUploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Images only (jpg, jpeg, png, webp)!'));
    }
  }
});

// Configure Cloudinary if environment variables are present
let isCloudinaryConfigured = false;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  isCloudinaryConfigured = true;
  console.log('🟢 Cloudinary upload configured successfully.');
} else {
  console.warn('🟡 Cloudinary credentials missing. Images will be saved to local server filesystem.');
}

// Helper function to handle upload to Cloudinary/Local
const handleImageUpload = async (file, req) => {
  if (!file) return null;

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'sih_civic_reports'
      });
      // Delete local temporary file
      fs.unlinkSync(file.path);
      return result.secure_url;
    } catch (err) {
      console.error('Cloudinary upload error, falling back to local static URL:', err);
      // Fallback to local url if upload fails
    }
  }
  
  // Local fallback: return local server URL
  const port = process.env.PORT || 5000;
  const baseUrl = `${req.protocol}://${req.hostname}:${port}`;
  return `/uploads/${path.basename(file.path)}`;
};

module.exports = {
  upload,
  handleImageUpload
};
