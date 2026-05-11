const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ctrl = require('./pets.controller');
const { verifyToken } = require('../../middleware/auth');

const uploadDir = path.join(__dirname, '../../../../uploads/pets');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.id}-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|png|webp|gif)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only images are allowed'));
  },
});

router.use(verifyToken);
router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/image', upload.single('image'), ctrl.uploadImage);

module.exports = router;
