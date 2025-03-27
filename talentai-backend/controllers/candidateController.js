const excelDB = require('../utils/excelDB');

exports.getProfile = async (req, res) => {
  try {
    const candidates = await excelDB.findAll('candidates.xlsx');
    const candidate = candidates.find(c => c.userId === req.user.id);

    if (!candidate) {
      return res.status(404).json({
        status: 'fail',
        message: 'Candidate not found',
      });
    }

    // Get user details
    const user = await excelDB.findOne('users.xlsx', req.user.id);
    
    // Get job details for applications
    const jobs = await excelDB.findAll('jobs.xlsx');
    const applications = candidate.applications.map(app => {
      const job = jobs.find(j => j.id === app.jobId);
      return { ...app, job };
    });

    res.status(200).json({
      status: 'success',
      data: {
        candidate: {
          ...candidate,
          applications,
          email: user.email
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const candidates = await excelDB.findAll('candidates.xlsx');
    const candidate = candidates.find(c => c.userId === req.user.id);

    if (!candidate) {
      return res.status(404).json({
        status: 'fail',
        message: 'Candidate not found',
      });
    }

    const updatedCandidate = await excelDB.update('candidates.xlsx', candidate.id, req.body);

    res.status(200).json({
      status: 'success',
      data: {
        candidate: updatedCandidate,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.applyForJob = async (req, res) => {
  try {
    // Check if job exists
    const job = await excelDB.findOne('jobs.xlsx', req.params.jobId);
    if (!job) {
      return res.status(404).json({
        status: 'fail',
        message: 'Job not found',
      });
    }

    // Get candidate
    const candidates = await excelDB.findAll('candidates.xlsx');
    const candidate = candidates.find(c => c.userId === req.user.id);
    
    // Check if already applied
    if (candidate.applications.some(app => app.jobId === req.params.jobId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'You have already applied for this job',
      });
    }

    // Add application
    const newApplication = {
      jobId: req.params.jobId,
      status: 'applied',
      appliedAt: new Date().toISOString(),
      interviewScore: null
    };

    const updatedApplications = [...candidate.applications, newApplication];
    const updatedCandidate = await excelDB.update('candidates.xlsx', candidate.id, {
      applications: updatedApplications
    });

    res.status(200).json({
      status: 'success',
      data: {
        candidate: updatedCandidate,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    const candidates = await excelDB.findAll('candidates.xlsx');
    const candidate = candidates.find(c => c.userId === req.user.id);
    const jobs = await excelDB.findAll('jobs.xlsx');

    const applications = candidate.applications.map(app => {
      const job = jobs.find(j => j.id === app.jobId);
      return { ...app, job };
    });

    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: {
        applications,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};