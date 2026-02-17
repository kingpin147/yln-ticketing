// src/lib/constants.ts
// These match the Prisma schema enums but are safe to import in client components

export enum Role {
    SUBMITTER = "SUBMITTER",
    AGENT = "AGENT",
    SUB_ADMIN = "SUB_ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN"
}

export enum Status {
    NEW = "NEW",
    IN_PROGRESS = "IN_PROGRESS",
    WAITING = "WAITING",
    RESOLVED = "RESOLVED",
    CLOSED = "CLOSED"
}

export enum Priority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
