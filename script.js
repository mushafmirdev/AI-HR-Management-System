// DOM Elements
const adminLoginForm = document.getElementById('admin-login-form');
const candidateLoginForm = document.getElementById('candidate-login-form');
const registrationForm = document.getElementById('registration-form');
const showRegisterLink = document.getElementById('show-register');
const registerSection = document.getElementById('register-section');
const loginSection = document.getElementById('login-section');
const adminDashboard = document.getElementById('admin-dashboard');
const candidateDashboard = document.getElementById('candidate-dashboard');
const darkModeToggle = document.getElementById('darkModeToggle');
const jobModal = document.getElementById('job-modal');
const closeModal = document.getElementById('close-modal');
const applyJobBtn = document.getElementById('apply-job-btn');

// Sample interview questions
const interviewQuestions = [
    "Tell us about your experience with frontend development.",
    "How do you handle cross-browser compatibility issues?",
    "Describe a challenging project you worked on and how you solved the problems.",
    "What frameworks are you most comfortable with and why?"
];

// Current question index
let currentQuestion = 0;

// Login Functions
adminLoginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    loginSection.style.display = 'none';
    adminDashboard.style.display = 'block';
    // In real app, you would verify credentials here
});

candidateLoginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    loginSection.style.display = 'none';
    candidateDashboard.style.display = 'block';
    // In real app, you would verify credentials here
});

// Registration Toggle
showRegisterLink.addEventListener('click', function(e) {
    e.preventDefault();
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
});

// Registration Form
registrationForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // In real app, you would:
    // 1. Validate inputs
    // 2. Upload resume
    // 3. Create candidate account
    // 4. Log them in automatically
    
    // For demo, just show candidate dashboard
    registerSection.style.display = 'none';
    candidateDashboard.style.display = 'block';
});

// Job Application Modal
applyJobBtn.addEventListener('click', function() {
    jobModal.style.display = 'flex';
});

closeModal.addEventListener('click', function() {
    jobModal.style.display = 'none';
});

// AI Interview Simulation
document.getElementById('submit-response').addEventListener('click', function() {
    const response = document.getElementById('interview-response').value;
    const chat = document.getElementById('interview-chat');
    
    // Add user response to chat
    if (response.trim() !== '') {
        chat.innerHTML += `<div class="user-message" style="text-align: right; margin: 0.5rem 0; color: var(--primary);">${response}</div>`;
        document.getElementById('interview-response').value = '';
        
        // AI "analyzes" response (simulated)
        setTimeout(() => {
            chat.innerHTML += `<div class="ai-message" style="margin: 0.5rem 0;">Thank you for your response. Let's move to the next question...</div>`;
            chat.scrollTop = chat.scrollHeight;
            
            // Next question or end interview
            currentQuestion++;
            if (currentQuestion < interviewQuestions.length) {
                setTimeout(() => {
                    chat.innerHTML += `<div class="ai-message" style="margin: 0.5rem 0;"><strong>Question ${currentQuestion + 1}:</strong> ${interviewQuestions[currentQuestion]}</div>`;
                    chat.scrollTop = chat.scrollHeight;
                }, 1000);
            } else {
                setTimeout(() => {
                    chat.innerHTML += `<div class="ai-message" style="margin: 0.5rem 0;">Thank you! Your interview is complete. The hiring team will review your responses.</div>`;
                    chat.scrollTop = chat.scrollHeight;
                }, 1000);
            }
        }, 1500);
    }
});

// Dark Mode Toggle
darkModeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    const icon = darkModeToggle.querySelector('i');
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
});

// Initialize first interview question
window.addEventListener('DOMContentLoaded', function() {
    const chat = document.getElementById('interview-chat');
    chat.innerHTML += `<div class="ai-message"><strong>Question 1:</strong> ${interviewQuestions[0]}</div>`;
});