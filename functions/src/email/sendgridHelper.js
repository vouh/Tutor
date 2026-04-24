/**
 * SendGrid Email Helper
 * Sends transactional emails for user events
 */

const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key from environment
const sendgridApiKey = process.env.SENDGRID_API_KEY;
if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
}

const senderEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@tutor.ke';
const senderName = 'Tutor Kenya';

/**
 * Send welcome email to new user
 * 
 * @param {string} email - User email
 * @param {string} displayName - User display name
 * @returns {Promise<void>}
 */
const sendWelcomeEmail = async (email, displayName) => {
  try {
    if (!sendgridApiKey) {
      console.warn('SendGrid API key not configured, skipping email');
      return;
    }

    const msg = {
      to: email,
      from: {
        email: senderEmail,
        name: senderName,
      },
      subject: 'Welcome to Tutor Kenya!',
      html: `
        <h1>Welcome, ${displayName}!</h1>
        <p>We're excited to have you join Tutor Kenya, Kenya's #1 E-Learning Platform.</p>
        
        <h2>Getting Started</h2>
        <ul>
          <li>Browse our collection of courses</li>
          <li>Enroll in courses that interest you</li>
          <li>Learn at your own pace</li>
          <li>Earn certificates upon completion</li>
        </ul>
        
        <p><a href="https://tutor.ke/courses" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Explore Courses</a></p>
        
        <p>If you have any questions, feel free to reach out to our support team.</p>
        
        <p>Happy Learning!<br>The Tutor Kenya Team</p>
      `,
    };

    await sgMail.send(msg);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending welcome email: ${error.message}`);
    // Don't throw - allow signup to complete even if email fails
  }
};

/**
 * Send enrollment confirmation email
 * 
 * @param {string} email - User email
 * @param {string} displayName - User display name
 * @param {string} courseName - Course title
 * @param {string} courseId - Course ID for link
 * @returns {Promise<void>}
 */
const sendEnrollmentConfirmation = async (email, displayName, courseName, courseId) => {
  try {
    if (!sendgridApiKey) {
      console.warn('SendGrid API key not configured, skipping email');
      return;
    }

    const courseUrl = `https://tutor.ke/courses/${courseId}`;

    const msg = {
      to: email,
      from: {
        email: senderEmail,
        name: senderName,
      },
      subject: `Enrollment Confirmed: ${courseName}`,
      html: `
        <h1>Enrollment Confirmed!</h1>
        <p>Hi ${displayName},</p>
        
        <p>Congratulations! You've successfully enrolled in <strong>${courseName}</strong>.</p>
        
        <h2>Next Steps</h2>
        <p><a href="${courseUrl}" style="background-color: #2196F3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Start Learning</a></p>
        
        <h2>Course Details</h2>
        <p>You can now access all course materials, including:</p>
        <ul>
          <li>Video lectures</li>
          <li>Course notes and resources</li>
          <li>Quizzes and assignments</li>
          <li>Lifetime access (no expiration)</li>
        </ul>
        
        <h2>Track Your Progress</h2>
        <p>Visit your <a href="https://tutor.ke/dashboard">dashboard</a> to track your progress and see your learning stats.</p>
        
        <p>If you have any questions about the course, please reach out to the instructor or contact our support team.</p>
        
        <p>Happy Learning!<br>The Tutor Kenya Team</p>
      `,
    };

    await sgMail.send(msg);
    console.log(`Enrollment confirmation sent to ${email}`);
  } catch (error) {
    console.error(`Error sending enrollment email: ${error.message}`);
    // Don't throw - allow enrollment to complete even if email fails
  }
};

/**
 * Send course reminder email
 * 
 * @param {string} email - User email
 * @param {string} displayName - User display name
 * @param {Array} courses - Array of enrolled courses
 * @returns {Promise<void>}
 */
const sendCourseReminder = async (email, displayName, courses = []) => {
  try {
    if (!sendgridApiKey) {
      console.warn('SendGrid API key not configured, skipping email');
      return;
    }

    const coursesList = courses
      .map(course => `<li><a href="https://tutor.ke/courses/${course.courseId}">${course.courseName}</a> (${course.percentComplete || 0}% complete)</li>`)
      .join('');

    const msg = {
      to: email,
      from: {
        email: senderEmail,
        name: senderName,
      },
      subject: 'Keep Learning - Resume Your Courses!',
      html: `
        <h1>Continue Your Learning Journey</h1>
        <p>Hi ${displayName},</p>
        
        <p>We noticed you have enrolled courses. Here's a reminder to continue your learning:</p>
        
        <h2>Your Enrolled Courses</h2>
        <ul>
          ${coursesList}
        </ul>
        
        <p><a href="https://tutor.ke/dashboard" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View Your Dashboard</a></p>
        
        <h2>Why Keep Learning?</h2>
        <ul>
          <li>Complete your courses at your own pace</li>
          <li>Earn certificates upon completion</li>
          <li>Boost your skills and career prospects</li>
          <li>Lifetime access to course materials</li>
        </ul>
        
        <p>If you'd like to adjust your notification preferences, visit your <a href="https://tutor.ke/settings">settings page</a>.</p>
        
        <p>Happy Learning!<br>The Tutor Kenya Team</p>
      `,
    };

    await sgMail.send(msg);
    console.log(`Course reminder sent to ${email}`);
  } catch (error) {
    console.error(`Error sending course reminder: ${error.message}`);
  }
};

/**
 * Send certificate email
 * 
 * @param {string} email - User email
 * @param {string} displayName - User display name
 * @param {string} courseName - Course title
 * @param {string} certificateId - Certificate ID
 * @returns {Promise<void>}
 */
const sendCertificateEmail = async (email, displayName, courseName, certificateId) => {
  try {
    if (!sendgridApiKey) {
      console.warn('SendGrid API key not configured, skipping email');
      return;
    }

    const certificateUrl = `https://tutor.ke/certificates/${certificateId}`;

    const msg = {
      to: email,
      from: {
        email: senderEmail,
        name: senderName,
      },
      subject: `Congratulations! Your Certificate for ${courseName}`,
      html: `
        <h1>🎉 Congratulations!</h1>
        <p>Hi ${displayName},</p>
        
        <p>You've successfully completed <strong>${courseName}</strong>! We're proud of your achievement.</p>
        
        <h2>Your Certificate</h2>
        <p>Your certificate of completion is now ready. You can view and download it here:</p>
        
        <p><a href="${certificateUrl}" style="background-color: #FFB81C; color: black; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View Certificate</a></p>
        
        <h2>Share Your Achievement</h2>
        <p>Your certificate is ready to share with employers, on LinkedIn, or anywhere else you'd like to showcase your learning.</p>
        
        <h2>Continue Learning</h2>
        <p>Why not explore other courses to expand your skills?</p>
        
        <p><a href="https://tutor.ke/courses" style="background-color: #2196F3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Explore More Courses</a></p>
        
        <p>Thank you for learning with us!<br>The Tutor Kenya Team</p>
      `,
    };

    await sgMail.send(msg);
    console.log(`Certificate email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending certificate email: ${error.message}`);
  }
};

/**
 * Send password reset email
 * 
 * @param {string} email - User email
 * @param {string} resetLink - Password reset link from Firebase
 * @returns {Promise<void>}
 */
const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    if (!sendgridApiKey) {
      console.warn('SendGrid API key not configured, skipping email');
      return;
    }

    const msg = {
      to: email,
      from: {
        email: senderEmail,
        name: senderName,
      },
      subject: 'Reset Your Tutor Kenya Password',
      html: `
        <h1>Password Reset Request</h1>
        <p>We received a request to reset your Tutor Kenya password.</p>
        
        <p>Click the button below to reset your password:</p>
        
        <p><a href="${resetLink}" style="background-color: #F44336; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a></p>
        
        <p>This link will expire in 1 hour.</p>
        
        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
        
        <p>Best regards,<br>The Tutor Kenya Team</p>
      `,
    };

    await sgMail.send(msg);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending password reset email: ${error.message}`);
  }
};

/**
 * Send contact form response email
 * 
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} subject - Message subject
 * @param {string} message - User message
 * @returns {Promise<void>}
 */
const sendContactConfirmation = async (email, name, subject, message) => {
  try {
    if (!sendgridApiKey) {
      console.warn('SendGrid API key not configured, skipping email');
      return;
    }

    const msg = {
      to: email,
      from: {
        email: senderEmail,
        name: senderName,
      },
      subject: 'We Received Your Message',
      html: `
        <h1>Thank You for Contacting Us</h1>
        <p>Hi ${name},</p>
        
        <p>We've received your message and will get back to you as soon as possible.</p>
        
        <h2>Your Message</h2>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
        
        <p>Our support team will review your inquiry and respond within 24 hours.</p>
        
        <p>In the meantime, feel free to explore our <a href="https://tutor.ke/courses">courses</a> or check out our <a href="https://tutor.ke/resources">resources</a>.</p>
        
        <p>Best regards,<br>The Tutor Kenya Team</p>
      `,
    };

    await sgMail.send(msg);
    console.log(`Contact confirmation sent to ${email}`);
  } catch (error) {
    console.error(`Error sending contact confirmation: ${error.message}`);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendEnrollmentConfirmation,
  sendCourseReminder,
  sendCertificateEmail,
  sendPasswordResetEmail,
  sendContactConfirmation,
};
