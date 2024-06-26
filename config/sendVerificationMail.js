const { createMailTransporter } = require('./transporter.config');

const sendVerificationMail = (user) => {
  const transporter = createMailTransporter();

  const mailOptions = {
    from: `"codecamp " <${process.env.EMAIL_ADDRESS}>`,
    to: user.email,
    html: `<p>
              Hello, ${user.firstName}, thank you for signing up to learn to code with our platform. Please click on the link
              below to verify your account.
              <a href = http://127.0.0.1:5173/auth/verify-email?emailToken=${user.emailToken}>Verify Email</a>
          </p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if(error){
      console.log(error);
    }else {
      console.log('Verification sent');
    }
  })
}

module.exports = { sendVerificationMail };
