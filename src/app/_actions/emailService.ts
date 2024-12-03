import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.NEXT_PUBLIC_SMTP_HOST,
  port: parseInt('587', 10),
  secure: false, // Use true para SSL (porta 465), false para TLS (porta 587)
  auth: {
    user: process.env.NEXT_PUBLIC_EMAIL_USER,
    pass: process.env.NEXT_PUBLIC_EMAIL_USER,
  },
})

export default transporter
