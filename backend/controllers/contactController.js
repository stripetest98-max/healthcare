const { sendContactEmail, sendAutoReply } = require('../services/emailService');

// Handle contact form submission
const submitContactForm = async (req, res) => {
  try {
    console.log('📧 Contact form submission received:', req.body);
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      console.log('❌ Validation failed: Missing fields');
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Validation failed: Invalid email format');
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    console.log('✅ Validation passed, sending emails...');

    // Send email to admin
    const adminEmailResult = await sendContactEmail(name, email, message);
    console.log('Admin email result:', adminEmailResult);
    
    if (!adminEmailResult.success) {
      console.log('❌ Failed to send admin email:', adminEmailResult.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again later.',
        error: adminEmailResult.error
      });
    }

    // Send auto-reply to user
    const autoReplyResult = await sendAutoReply(name, email);
    console.log('Auto-reply result:', autoReplyResult);

    res.status(200).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.'
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing your request',
      error: error.message
    });
  }
};

module.exports = {
  submitContactForm
};
