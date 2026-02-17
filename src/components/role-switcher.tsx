"use client";

import { Role } from "@/lib/constants";
import { updateUserRole } from "@/app/actions/admin";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";

export function RoleSwitcher({ userId, currentRole, canManageAdmins }: { userId: string, currentRole: Role, canManageAdmins: boolean }) {
    const [loading, setLoading] = useState(false);

    const handleRoleChange = async (newRole: string) => {
        setLoading(true);
        try {
            await updateUserRole(userId, newRole as Role);
            toast.success("Role updated successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to update role");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Select disabled={loading} value={currentRole} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-[140px] h-8 rounded-full text-xs font-bold">
                <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
                <SelectItem value={Role.SUBMITTER}>User</SelectItem>
                <SelectItem value={Role.AGENT}>Agent</SelectItem>
                {canManageAdmins && <SelectItem value={Role.SUB_ADMIN}>Sub Admin</SelectItem>}
                {canManageAdmins && <SelectItem value={Role.SUPER_ADMIN}>Super Admin</SelectItem>}
            </SelectContent>
        </Select>
    );
}
