"use server";

import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/constants";

export async function syncUser() {
    const user = await currentUser();
    if (!user) return null;

    const userCount = await prisma.user.count();
    const isOwnerEmail = user.emailAddresses.some(e => e.emailAddress === "nomiking0072012@gmail.com");
    const isFirstUser = userCount === 0;

    const initialRole = (isOwnerEmail || isFirstUser)
        ? Role.SUPER_ADMIN
        : ((user.publicMetadata.role as Role) || Role.SUBMITTER);

    const dbUser = await prisma.user.upsert({
        where: { clerkId: user.id },
        update: {
            name: `${user.firstName} ${user.lastName}`,
            email: user.emailAddresses[0].emailAddress,
            role: isOwnerEmail ? Role.SUPER_ADMIN : undefined, // Force Super Admin for owner
        },
        create: {
            clerkId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.emailAddresses[0].emailAddress,
            role: initialRole,
        },
    });

    // If we just made them a super admin (either first user or owner), sync back to Clerk metadata
    if ((isFirstUser || isOwnerEmail) && user.publicMetadata.role !== Role.SUPER_ADMIN) {
        const client = await clerkClient();
        await client.users.updateUserMetadata(user.id, {
            publicMetadata: {
                role: Role.SUPER_ADMIN,
            },
        });
    }

    return dbUser;
}
