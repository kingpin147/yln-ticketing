"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role, Status, Priority } from "@/lib/constants";
import { sendEmail } from "@/lib/resend";
import { createActivityLog } from "@/lib/activity";

export async function createTicket(formData: {
    title: string;
    description: string;
    priority: Priority;
    department: string;
}) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Get or sync the internal DB user
    let dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!dbUser) {
        // In a real app, you might want to sync the user here if they don't exist
        // For now, let's assume they might not be synced yet if it's their first action
        throw new Error("User profile not found. Please refresh.");
    }

    // Generate a ticket ID (simple implementation - should ideally use a counter or serial)
    const count = await prisma.ticket.count();
    const ticketId = `YLN-${String(count + 1).padStart(4, '0')}`;

    const ticket = await prisma.ticket.create({
        data: {
            ticketId,
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            department: formData.department,
            status: Status.NEW,
            submittedById: dbUser.id,
        },
    });

    // Notify user
    if (dbUser.email) {
        await sendEmail({
            to: dbUser.email,
            subject: `Ticket Received: ${ticketId}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #6366f1;">Ticket Received</h2>
                    <p>Hi ${dbUser.name},</p>
                    <p>Your ticket <strong>${ticketId}</strong> has been successfully submitted. Our team will review it shortly.</p>
                    <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
                        <p><strong>Title:</strong> ${formData.title}</p>
                        <p><strong>Priority:</strong> ${formData.priority}</p>
                    </div>
                </div>
            `
        }).catch(e => console.error("Email notification failed", e));
    }

    revalidatePath("/my-tickets");
    revalidatePath("/dashboard");

    // Log Activity
    await createActivityLog({
        ticketId: ticket.id,
        userId: dbUser.id,
        action: "TICKET_CREATED",
        details: `Ticket created with priority ${formData.priority} in ${formData.department} department.`,
    });

    return ticket;
}

export async function getDashboardTickets(search?: string) {
    const { userId } = await auth();
    if (!userId) return [];

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!dbUser) return [];

    const where: any = {};
    if (dbUser.role !== Role.AGENT && dbUser.role !== Role.SUPER_ADMIN && dbUser.role !== Role.SUB_ADMIN) {
        where.submittedById = dbUser.id;
    }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { ticketId: { contains: search, mode: 'insensitive' } },
        ];
    }

    return prisma.ticket.findMany({
        where,
        orderBy: { createdAt: "desc" },
    });
}

export async function getMyTickets(search?: string) {
    const { userId } = await auth();
    if (!userId) return [];

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!dbUser) return [];

    const where: any = { submittedById: dbUser.id };
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { ticketId: { contains: search, mode: 'insensitive' } },
        ];
    }

    return prisma.ticket.findMany({
        where,
        orderBy: { createdAt: "desc" },
    });
}
export async function getTicketById(id: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    return prisma.ticket.findUnique({
        where: { id },
        include: {
            submittedBy: true,
            assignedTo: true,
            comments: {
                include: {
                    user: true,
                },
                orderBy: { createdAt: "asc" },
            },
            attachments: true,
            activityLogs: {
                include: {
                    user: true,
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });
}

export async function updateTicketStatus(id: string, status: Status) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check if user is AGENT or ADMIN or the submitter (though submitters usually can't change status)
    const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!dbUser || (dbUser.role !== Role.AGENT && dbUser.role !== Role.SUPER_ADMIN && dbUser.role !== Role.SUB_ADMIN)) {
        throw new Error("Only agents or admins can update status");
    }

    const ticket = await prisma.ticket.update({
        where: { id },
        data: { status },
        include: { submittedBy: true }
    });

    // Notify submitter
    if (ticket.submittedBy.email) {
        await sendEmail({
            to: ticket.submittedBy.email,
            subject: `Ticket Status Updated: ${ticket.ticketId}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #6366f1;">Status Update</h2>
                    <p>Your ticket <strong>${ticket.ticketId}</strong> has been moved to <strong>${status}</strong>.</p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tickets/${id}" 
                       style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px;">
                        View Ticket
                    </a>
                </div>
            `
        }).catch(e => console.error("Status update email failed", e));
    }

    revalidatePath("/dashboard");
    revalidatePath("/my-tickets");
    revalidatePath(`/tickets/${id}`);
    revalidatePath("/tickets/kanban");

    // Log Activity
    await createActivityLog({
        ticketId: id,
        userId: dbUser.id,
        action: "STATUS_CHANGE",
        details: `Status changed to ${status.replace("_", " ")}`,
    });

    return ticket;
}

export async function assignTicket(id: string, agentId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!dbUser || (dbUser.role !== Role.SUPER_ADMIN && dbUser.role !== Role.SUB_ADMIN)) {
        throw new Error("Only admins can assign tickets");
    }

    const ticket = await prisma.ticket.update({
        where: { id },
        data: { assignedToId: agentId },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/tickets/${id}`);
    revalidatePath("/tickets/kanban");

    // Log Activity
    const agent = await prisma.user.findUnique({ where: { id: agentId } });
    await createActivityLog({
        ticketId: id,
        userId: dbUser.id,
        action: "ASSIGNMENT",
        details: `Assigned to ${agent?.name || "Unknown"}`,
    });

    return ticket;
}

export async function getUnassignedTickets() {
    const { userId } = await auth();
    if (!userId) return [];

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!dbUser || (dbUser.role !== Role.AGENT && dbUser.role !== Role.SUPER_ADMIN && dbUser.role !== Role.SUB_ADMIN)) {
        return [];
    }

    return prisma.ticket.findMany({
        where: { assignedToId: null },
        orderBy: { createdAt: "desc" },
    });
}

export async function getMyAssignedTickets() {
    const { userId } = await auth();
    if (!userId) return [];

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!dbUser) return [];

    return prisma.ticket.findMany({
        where: { assignedToId: dbUser.id },
        orderBy: { createdAt: "desc" },
    });
}
export async function deleteTicket(id: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!dbUser || dbUser.role !== Role.SUPER_ADMIN) {
        throw new Error("Only Super Admins can delete tickets");
    }

    await prisma.ticket.delete({
        where: { id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/my-tickets");
    revalidatePath("/tickets/kanban");

    return { success: true };
}
export async function addComment(id: string, content: string, isPrivate: boolean = false) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!dbUser) throw new Error("User not found");

    if (isPrivate && (dbUser.role === Role.SUBMITTER)) {
        throw new Error("Only staff can post internal notes");
    }

    const comment = await prisma.comment.create({
        data: {
            content,
            isPrivate,
            ticketId: id,
            userId: dbUser.id,
        },
    });

    // Log Activity
    await createActivityLog({
        ticketId: id,
        userId: dbUser.id,
        action: isPrivate ? "INTERNAL_NOTE" : "COMMENT",
        details: isPrivate ? "Added an internal note" : "Post a new comment",
    });

    revalidatePath(`/tickets/${id}`);
    return comment;
}
