import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const secret_key = process.env.SECRET_KEY;

const admin_email = process.env.ADMIN_EMAIL;

const admin_password = process.env.ADMIN_PASSWORD;

const client_port = 3000;

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: admin_email, // generated ethereal user
    pass: admin_password, // generated ethereal password
  },
});

export const sendMail = async (userId, email) => {
  const payload = {
    id: userId,
    email: email,
  };

  const token = await jwt.sign(payload, secret_key, {
    expiresIn: "24h",
  });

  transporter.sendMail({
    from: admin_email, // sender address
    to: email, // list of receivers
    subject: "new password...!!", // Subject line
    html: `<a href="http://192.168.0.164:${client_port}/newpassword?token=${token}">Click here to reset-password</a>`,
  });
};
