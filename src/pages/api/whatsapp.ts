/*
// pages/api/whatsapp.js

import { NextApiRequest, NextApiResponse } from 'next';
import Whatsapp  from 'whatsapp-business-api';

const whatsapp = new Whatsapp({
  accessToken: process.env.NEXT_PUBLIC_METATOKEN,
  phoneNumberId: '409640815575363',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Verificar a autenticidade da solicitação
      // ...

      // Extrair a mensagem do freelancer
      const { from, message } = req.body;

      // Processar a mensagem
      let response;
      if (message.toLowerCase() === 'oi') {
        response = 'Olá! Bem-vindo ao [Nome do seu SaaS]. Que tipo de trabalho você procura?';
      } else {
        // Consultar a API JSON para buscar trabalhos
        const trabalhos = await buscarTrabalhos(message);
        response = formatarTrabalhos(trabalhos);
      }

      // Enviar a resposta
      await whatsapp.sendMessage(from, response);

      res.status(200).end();
    } catch (error) {
      console.error(error);
      res.status(500).end();
    }
  } else {
    res.status(405).end();
  }
}

*/ 
