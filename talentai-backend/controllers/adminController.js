const excelDB = require('../utils/excelDB');

exports.getDashboardStats = async (req, res) => {
  try {
    const jobs = await excelDB.findAll('jobs.xlsx');
    const candidates = await excelDB.findAll('candidates.xlsx');

    const activeJobs = jobs.filter(job => job.status === 'active').length;
    const totalCandidates = candidates.length;
    
    let completedInterviews = 0;
    candidates.forEach(candidate => {
      completedInterviews += candidate.applications.filter(app => app.interviewScore !== null).length;
    });

    res.status(200).json({
      status: 'success',
      data: {
        activeJobs,
        totalCandidates,
        completedInterviews,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.createJob = async (req, res) => {
  try {
    const newJob = await excelDB.create('jobs.xlsx', {
      ...req.body,
      postedBy: req.user.id,
      postedAt: new Date().toISOString(),
      status: 'active'
    });

    res.status(201).json({
      status: 'success',
      data: {
        job: newJob,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await excelDB.findAll('candidates.xlsx');
    const users = await excelDB.findAll('users.xlsx');
    const jobs = await excelDB.findAll('jobs.xlsx');

    const enrichedCandidates = candidates.map(candidate => {
      const user = users.find(u => u.id === candidate.userId);
      const enrichedApplications = candidate.applications.map(app => {
        const job = jobs.find(j => j.id === app.jobId);
        return { ...app, job };
      });
      
      return {
        ...candidate,
        email: user.email,
        applications: enrichedApplications
      };
    });

    res.status(200).json({
      status: 'success',
      results: enrichedCandidates.length,
      data: {
        candidates: enrichedCandidates,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.updateCandidateStatus = async (req, res) => {
  try {
    const { candidateId, applicationId } = req.params;
    const { status } = req.body;

    const candidates = await excelDB.findAll('candidates.xlsx');
    const candidate = candidates.find(c => c.id === candidateId);
    
    if (!candidate) {
      return res.status(404).json({
        status: 'fail',
        message: 'Candidate not found',
      });
    }

    const applicationIndex = candidate.applications.findIndex(app => app.id === applicationId);
    if (applicationIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Application not found',
      });
    }

    const updatedApplications = [...candidate.applications];
    updatedApplications[applicationIndex] = {
      ...updatedApplications[applicationIndex],
      status
    };

    await excelDB.update('candidates.xlsx', candidate.id, {
      applications: updatedApplications
    });

    res.status(200).json({
      status: 'success',
      data: {
        candidate: {
          ...candidate,
          applications: updatedApplications
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