const nodemailer = require("nodemailer");

const sendEmail = (req, res) => {
  const { to, subject, text } = req.body;

  // Configure Nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL, // Retrieve email from environment variable
      pass: process.env.PASSWORD, // Replace with your Gmail password or an app-specific password
    },
  });

  // Email options
  const mailOptions = {
    from: process.env.GMAIL,
    to,
    subject,
    text,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).send(error.toString());
    }
    console.log("Email sent:", info.response);
    res.status(200).send("Email sent: " + info.response);
  });
};
module.exports = { sendEmail };
