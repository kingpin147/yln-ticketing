import { auth } from "@clerk/nextjs/server";
import { Role } from "../../generated/prisma/index.js";

export const checkRole = async (role: Role) => {
    const { sessionClaims } = await auth();
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;
    return metadata?.role === role;
};

export const getRole = async () => {
    const { sessionClaims } = await auth();
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;
    return (metadata?.role as Role) || Role.SUBMITTER;
};

export const isAdmin = async () => {
    const role = await getRole();
    return role === Role.SUPER_ADMIN || role === Role.SUB_ADMIN;
};

export const isSuperAdmin = async () => {
    const role = await getRole();
    return role === Role.SUPER_ADMIN;
};
