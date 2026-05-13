const router = require('express').Router();
const ctrl = require('./admin.controller');
const { verifyToken, requireAdmin } = require('../../middleware/auth');

router.use(verifyToken, requireAdmin);
router.get('/dashboard', ctrl.dashboard);
router.get('/users', ctrl.users);
router.get('/users/:id', ctrl.userDetail);
router.get('/boarding/:id', ctrl.boardingDetail);
router.put('/boarding/:id/status', ctrl.updateBoardingStatus);
router.get('/grooming/:id', ctrl.groomingDetail);
router.put('/grooming/:id/status', ctrl.updateGroomingStatus);
router.get('/training', ctrl.trainingBookings);
router.post('/training', ctrl.createTrainingBooking);
router.put('/training/:id/status', ctrl.updateTrainingStatus);

module.exports = router;
