"use server";

import { db } from "@/app/_lib/prisma";
import { Prisma } from "@prisma/client";

export const createStore = async (data: Prisma.StoresCreateInput) => {
   return await db.stores.create({
        data
    });
}
