const express = require('express');
const router = express.Router();
const {
  createIssue,
  getIssues,
  getIssueById,
  updateIssueStatus,
  deleteIssue,
  getIssueStats
} = require('../controllers/issueController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes are protected
router.use(protect);

// GET /api/issues/stats - Get analytics dashboard data
router.get('/stats', getIssueStats);

// POST /api/issues — create (with optional image upload)
router.post('/', upload.single('image'), createIssue);

// GET /api/issues — list all (admin sees all, citizen sees own)
router.get('/', getIssues);

// GET /api/issues/:id — single issue
router.get('/:id', getIssueById);

// PUT /api/issues/:id/status — update status (admin only)
router.put('/:id/status', authorize('admin'), updateIssueStatus);

// DELETE /api/issues/:id — delete (admin or owner)
router.delete('/:id', deleteIssue);

module.exports = router;
