const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');
const adminController = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(isAdmin);

// User management routes
// @accepts application/x-www-form-urlencoded
router.get('/users', adminController.getAllUsers);
router.get('/users/:username/activity', adminController.getUserActivity);

// @accepts application/x-www-form-urlencoded
// @body {reason?: string, until?: string}
router.post('/users/:id/suspend', adminController.suspendUser);

// @accepts application/x-www-form-urlencoded
router.post('/users/:id/unsuspend', adminController.unsuspendUser);

// @accepts application/x-www-form-urlencoded
// @body {reason?: string}
router.post('/users/:id/softDelete', adminController.softDeleteUser);

// @accepts application/x-www-form-urlencoded
// @body {confirm: string|boolean}
router.delete('/users/:id', adminController.permanentDeleteUser);

// Statistics routes
// @accepts application/x-www-form-urlencoded
router.get('/stats/registrations', adminController.registrationStats);

module.exports = router;
