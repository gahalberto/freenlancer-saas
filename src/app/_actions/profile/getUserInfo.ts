import { db } from "@/app/_lib/prisma";
import { User } from "@prisma/client";

export const getUserInfo = async (id: string): Promise<User | undefined> => {
    const user = await db.user.findUnique({
        where: {
            id
        }
    });

    return user || undefined;
};
