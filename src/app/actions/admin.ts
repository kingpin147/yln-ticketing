"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@/lib/constants";
import { isSuperAdmin, isAdmin } from "@/lib/roles";

export async function getAllUsers(params?: { search?: string; role?: Role }) {
    const adminCheck = await isAdmin();
    if (!adminCheck) throw new Error("Unauthorized");

    const where: any = {};
    if (params?.search) {
        where.OR = [
            { name: { contains: params.search, mode: 'insensitive' } },
            { email: { contains: params.search, mode: 'insensitive' } },
        ];
    }
    if (params?.role && params.role !== "ALL" as any) {
        where.role = params.role;
    }

    return prisma.user.findMany({
        where,
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

export async function createUser(data: { name: string; email: string; role: Role }) {
    const adminCheck = await isAdmin();
    const superAdminCheck = await isSuperAdmin();

    if (!adminCheck) throw new Error("Unauthorized");

    // Sub-admins can only create AGENTS and SUBMITTERS
    if (!superAdminCheck && (data.role === Role.SUPER_ADMIN || data.role === Role.SUB_ADMIN)) {
        throw new Error("Sub-admins cannot create users with Admin roles");
    }

    // Split name for Clerk
    const nameParts = data.name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || " ";

    const client = await clerkClient();

    // Create in Clerk
    const clerkUser = await client.users.createUser({
        firstName,
        lastName,
        emailAddress: [data.email],
        publicMetadata: {
            role: data.role,
        },
        // In a real app, you might want to invite them instead of creating directly
        // but the user asked to "add agents and users", so we create.
        // Password is not set, they will need to reset or login via SSO/OTP if enabled.
        skipPasswordChecks: true,
        skipPasswordRequirement: true,
    });

    // Create in Prisma
    const user = await prisma.user.create({
        data: {
            clerkId: clerkUser.id,
            name: data.name,
            email: data.email,
            role: data.role,
        },
    });

    revalidatePath("/admin/users");
    return user;
}

export async function inviteUser(data: { email: string; role: Role }) {
    const adminCheck = await isAdmin();
    const superAdminCheck = await isSuperAdmin();

    if (!adminCheck) throw new Error("Unauthorized");

    // Sub-admins can only invite AGENTS or SUBMITTERS
    if (!superAdminCheck && (data.role === Role.SUPER_ADMIN || data.role === Role.SUB_ADMIN)) {
        throw new Error("Sub-admins cannot invite users with Admin roles");
    }

    const client = await clerkClient();

    // Create invitation in Clerk
    const invitation = await client.invitations.createInvitation({
        emailAddress: data.email,
        publicMetadata: {
            role: data.role,
        },
        ignoreExisting: true, // If they are already invited/present, this helps avoid some errors
    });

    revalidatePath("/admin/users");
    return invitation;
}
