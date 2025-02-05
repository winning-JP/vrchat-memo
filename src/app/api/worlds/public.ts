import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prismadb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }
  const worlds = await prisma.world.findMany({
    where: { published: true },
    include: { tags: true },
  });
  res.status(200).json(worlds);
}
