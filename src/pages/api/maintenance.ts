import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.json({ maintenance: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true' });
  }
  