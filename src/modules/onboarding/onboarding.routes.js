const router = require('express').Router();
const multer = require('multer');
const ctrl = require('./onboarding.controller');
const { verifyToken } = require('../../middleware/auth');

const upload = multer({ dest: 'uploads/' });

router.post('/', verifyToken, ctrl.submit);
router.post('/identity-proof', verifyToken, upload.single('file'), ctrl.uploadIdentityProof);

module.exports = router;
