// src/lib/activity.ts
import { prisma } from "./prisma";

export async function createActivityLog({
    ticketId,
    userId,
    action,
    details,
}: {
    ticketId: string;
    userId?: string;
    action: string;
    details: string;
}) {
    try {
        await prisma.activityLog.create({
            data: {
                ticketId,
                userId,
                action,
                details,
            },
        });
    } catch (error) {
        console.error("Failed to create activity log:", error);
    }
}
