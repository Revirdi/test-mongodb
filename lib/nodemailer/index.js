require("dotenv").config();
const nodemailer = require("nodemailer");

const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN } = process.env;

const courier = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "ardwiyanimpact@gmail.com",
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    refreshToken: REFRESH_TOKEN,
  },
});

const sendMail = async ({ email, token }) => {
  const mail = {
    from: "DEVELOPER CUITERS <ardwiyanimpact@gmail.com>",
    to: email,
    subject: "User Verification",
    html: `<h1>Halo, klik <a href="http://localhost:8800/users/verification/${token}">link</a> berikut untuk verifikasi</h1>`,
  };

  try {
    await courier.sendMail(mail);
    console.log("email berhasil dikirim");
  } catch (error) {
    throw error;
  }
};

module.exports = { sendMail };
