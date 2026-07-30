const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { upload, handleImageUpload } = require('../middleware/upload');
const { Report } = require('../db');

// @route   POST api/reports
// @desc    Create a civic issue report
// @access  Private (Citizen or Official, typically Citizen)
router.post('/', [auth, upload.single('image')], async (req, res) => {
  const { title, description, category, lat, lng, address } = req.body;

  try {
    let imageUrl = null;
    if (req.file) {
      imageUrl = await handleImageUpload(req.file, req);
    }

    const reportData = {
      title,
      description,
      category,
      imageUrl,
      location: {
        lat: parseFloat(lat) || 0,
        lng: parseFloat(lng) || 0,
        address: address || ''
      },
      status: 'Pending',
      citizen: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      },
      officialComment: '',
      resolutionImageUrl: null,
      history: [
        {
          status: 'Pending',
          updatedBy: req.user.name,
          comment: 'Issue reported and queued for department verification.',
          updatedAt: new Date()
        }
      ]
    };

    const report = await Report.create(reportData);
    res.json(report);
  } catch (err) {
    console.error('Create report error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reports
// @desc    Get all reports (with optional status/category filtering)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, category, citizenId } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (citizenId) filter['citizen.id'] = citizenId;

    const reports = await Report.find(filter);
    
    // Sort by latest (we can sort programmatically if fallback mode, or MongoDB handles it.
    // Let's sort programmatically here to ensure compatibility on both modes).
    reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(reports);
  } catch (err) {
    console.error('Get reports error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reports/my-reports
// @desc    Get reports created by logged in citizen
// @access  Private
router.get('/my-reports', auth, async (req, res) => {
  try {
    const reports = await Report.find({ 'citizen.id': req.user.id });
    reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(reports);
  } catch (err) {
    console.error('Get my-reports error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reports/:id
// @desc    Get report by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }
    res.json(report);
  } catch (err) {
    console.error('Get report by ID error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/reports/:id/status
// @desc    Update report status (Officials only)
// @access  Private
router.put('/:id/status', [auth, upload.single('resolutionImage')], async (req, res) => {
  const { status, comment } = req.body;

  try {
    // Only officials can update status
    if (req.user.role !== 'official') {
      return res.status(403).json({ msg: 'Access denied: Only officials can update status' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    let resolutionImageUrl = report.resolutionImageUrl;
    if (req.file) {
      resolutionImageUrl = await handleImageUpload(req.file, req);
    }

    // Build history entry
    const historyItem = {
      status,
      updatedBy: `${req.user.name} (${req.user.department} Department)`,
      comment: comment || `Status changed to ${status}`,
      updatedAt: new Date()
    };

    const updateFields = {
      status,
      officialComment: comment || report.officialComment,
      resolutionImageUrl,
      history: [...(report.history || []), historyItem]
    };

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    res.json(updatedReport);
  } catch (err) {
    console.error('Update status error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
