import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // 1. Verificar a assinatura da solicitação (opcional, mas recomendado)
      // ...

      // 2. Processar a mensagem recebida
      const message = req.body.entry[0].changes[0].value.messages[0];
      const sender = message.from;
      const messageContent = message.text.body;

      // 3. Implementar a lógica do seu robô
      if (messageContent.toLowerCase() === 'oi') {
        // Enviar uma mensagem de volta
        await sendMessage(sender, 'Olá! Como posso te ajudar?');
      } else {
        // Responder com uma mensagem padrão
        await sendMessage(sender, 'Não entendi a sua mensagem.');
      }

      // 4. Retornar uma resposta de sucesso
      res.status(200).json({ message: 'Webhook recebido com sucesso!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao processar o webhook.' });
    }
  } else {
    // Lidar com a verificação do token (GET request)
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN; 
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        res.status(200).send(challenge);
      } else {
        res.status(403);
      }
    }
  }
}

async function sendMessage(to: string, message: string) {
  // Implementar a lógica para enviar mensagens usando a API do WhatsApp
  // ...
}