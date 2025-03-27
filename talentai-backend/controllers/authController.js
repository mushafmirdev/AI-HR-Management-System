const excelDB = require('../utils/excelDB');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const sendEmail = require('../config/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password',
      });
    }

    const users = await excelDB.findAll('users.xlsx');
    const user = users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password',
      });
    }

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.registerCandidate = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    // Check if user exists
    const users = await excelDB.findAll('users.xlsx');
    if (users.some(u => u.email === email)) {
      return res.status(400).json({
        status: 'fail',
        message: 'User already exists with this email',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const newUser = await excelDB.create('users.xlsx', {
      email,
      password: hashedPassword,
      role: 'candidate',
    });

    // Create candidate profile
    await excelDB.create('candidates.xlsx', {
      userId: newUser.id,
      firstName,
      lastName,
      phone,
      resume: req.file ? `/uploads/resumes/${req.file.filename}` : '',
      skills: [],
      applications: [],
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const users = await excelDB.findAll('users.xlsx');
    const user = users.find(u => u.email === req.body.email);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'There is no user with that email address',
      });
    }

    const resetToken = uuidv4();
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;

    await excelDB.update('users.xlsx', user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
        html: `<p>Forgot your password? Click <a href="${resetURL}">here</a> to reset it.</p>`,
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      await excelDB.update('users.xlsx', user.id, {
        passwordResetToken: null,
        passwordResetExpires: null,
      });

      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the email. Try again later!',
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const users = await excelDB.findAll('users.xlsx');
    const user = users.find(u => 
      u.passwordResetToken === req.params.token &&
      new Date(u.passwordResetExpires) > new Date()
    );

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired',
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    
    await excelDB.update('users.xlsx', user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await excelDB.findOne('users.xlsx', decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token does no longer exist.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};