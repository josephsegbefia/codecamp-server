const { createMailTransporter } = require("./transporter.config");

const sendPasswordResetEmail = (user) => {
  const transporter = createMailTransporter();

  const mailOptions = {
    from: `"WebWeavrr " <${process.env.EMAIL_ADDRESS}>`,
    to: user.email,
    html: `<p>
            Hello 👋 ${user.firstName}, click the link to reset your password
            <a href = http://127.0.0.1:5173/password-reset?passwordResetToken=${user.passwordResetToken}>Reset Password</a>
         </p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent");
    }
  });
};

module.exports = { sendPasswordResetEmail };
