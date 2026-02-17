import { auth } from "@clerk/nextjs/server";
import { Role } from "@/lib/constants";
import { prisma } from "./prisma";

export const checkRole = async (role: Role) => {
    const currentRole = await getDbRole();
    return currentRole === role;
};

export const getRole = async () => {
    const { sessionClaims } = await auth();
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;
    return (metadata?.role as Role) || Role.SUBMITTER;
};

export const isAdmin = async () => {
    const role = await getDbRole();
    return role === Role.SUPER_ADMIN || role === Role.SUB_ADMIN;
};

export const isSuperAdmin = async () => {
    const role = await getDbRole();
    return role === Role.SUPER_ADMIN;
};

export const getDbRole = async () => {
    const { userId } = await auth();
    if (!userId) return Role.SUBMITTER;

    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    return (user?.role as Role) || Role.SUBMITTER;
};
