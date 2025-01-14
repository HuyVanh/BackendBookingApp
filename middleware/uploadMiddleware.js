const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/avatars/');
    },
    filename: function (req, file, cb) {
      const userId = req.user.user_id;
      const fileExt = path.extname(file.originalname);
      cb(null, `avatar-${userId}-${Date.now()}${fileExt}`);
    }
  });

  const upload = multer({ 
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Chỉ chấp nhận file ảnh (jpg, jpeg, png)'));
      }
      cb(null, true);
    }
  });

module.exports = upload;