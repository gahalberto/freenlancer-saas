// pages/api/getDirections.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { originLat, originLng, destLat, destLng } = req.query

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
    )
    const data = await response.json()

    if (data.status === 'OK') {
      res.status(200).json(data)
    } else {
      res.status(400).json({ error: 'Erro ao obter direções', details: data })
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor', details: error })
  }
}
