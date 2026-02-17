"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@/lib/constants";
import { isSuperAdmin, isAdmin } from "@/lib/roles";

export async function getAllUsers() {
    const adminCheck = await isAdmin();
    if (!adminCheck) throw new Error("Unauthorized");

    return prisma.user.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { tickets: true, assignedTickets: true }
            }
        }
    });
}

export async function updateUserRole(targetUserId: string, newRole: Role) {
    const adminCheck = await isAdmin();
    const superAdminCheck = await isSuperAdmin();

    if (!adminCheck) throw new Error("Unauthorized");

    // Sub-admins can only manage AGENTS and SUBMITTERS
    if (!superAdminCheck && (newRole === Role.SUPER_ADMIN || newRole === Role.SUB_ADMIN)) {
        throw new Error("Sub-admins cannot promote users to Admin levels");
    }

    // Update in DB
    const user = await prisma.user.update({
        where: { id: targetUserId },
        data: { role: newRole },
    });

    // Update in Clerk Metadata so middleware/helpers work
    const client = await clerkClient();
    await client.users.updateUserMetadata(user.clerkId, {
        publicMetadata: {
            role: newRole,
        },
    });

    revalidatePath("/admin/users");
    revalidatePath("/dashboard");
    return user;
}

export async function deleteUser(targetUserId: string) {
    const superAdminCheck = await isSuperAdmin();
    if (!superAdminCheck) throw new Error("Only Super Admins can delete users");

    const user = await prisma.user.findUnique({
        where: { id: targetUserId }
    });

    if (!user) throw new Error("User not found");

    // Check if they have tickets or assignments
    // (In a real app, you might want to re-assign those first)

    await prisma.user.delete({
        where: { id: targetUserId },
    });

    const client = await clerkClient();
    await client.users.deleteUser(user.clerkId);

    revalidatePath("/admin/users");
    return { success: true };
}
