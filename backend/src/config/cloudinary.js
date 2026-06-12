const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createStorage = (folder, allowedFormats) => new CloudinaryStorage({
  cloudinary,
  params: {
    folder: `emp-mgmt/${folder}`,
    allowed_formats: allowedFormats || ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    transformation: folder === 'profiles' ? [{ width: 500, height: 500, crop: 'fill' }] : [],
  },
});

const profileUpload = multer({ storage: createStorage('profiles', ['jpg', 'jpeg', 'png']) });
const resumeUpload = multer({ storage: createStorage('resumes', ['pdf', 'doc', 'docx']) });
const documentUpload = multer({ storage: createStorage('documents', ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']) });

module.exports = { cloudinary, profileUpload, resumeUpload, documentUpload };
