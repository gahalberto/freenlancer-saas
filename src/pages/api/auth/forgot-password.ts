import { findUserByEmail } from '@/app/_actions/users/findUserByEmail'
import jwt from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('EMAIL_USER:', process.env.EMAIL_USER)
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD)
  console.log('SMTP_HOST:', process.env.SMTP_HOST)
  console.log('SMTP_PORT:', process.env.SMTP_PORT)

  if (req.method === 'POST') {
    const { email } = req.body

    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'defaultSecret', {
      expiresIn: '1h', // Expira em 1 hora
    })

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/resetar?token=${token}`

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        logger: true, // Log detalhado
        debug: true, // Ativa modo debug
      })

      await transporter.sendMail({
        from: `"Beit Yaakov" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Recuperação de senha',
        text: `Clique no link para recuperar a senha: ${resetLink}`,
        html: `<p>Clique no link para recuperar a senha: <a href="${resetLink}">${resetLink}</a></p>`,
      })

      return res.status(200).json({ message: 'E-mail de redefinição enviado com sucesso' })
    } catch (error) {
      console.error('Erro ao enviar o e-mail:', error)
      return res.status(500).json({ message: 'Erro ao enviar o e-mail' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Método ${req.method} não permitido`)
  }
}
