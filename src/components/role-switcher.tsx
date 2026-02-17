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
            <SelectTrigger className="w-[160px] h-10 rounded-full text-[10px] font-black uppercase tracking-widest bg-zinc-50 border-zinc-100 hover:bg-white transition-all">
                <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white">
                <SelectItem value={Role.SUBMITTER} className="rounded-xl font-bold py-3">User Access</SelectItem>
                <SelectItem value={Role.AGENT} className="rounded-xl font-bold py-3">Agent Access</SelectItem>
                {canManageAdmins && <SelectItem value={Role.SUB_ADMIN} className="rounded-xl font-bold py-3 text-primary">Sub Admin (Control)</SelectItem>}
                {canManageAdmins && <SelectItem value={Role.SUPER_ADMIN} className="rounded-xl font-bold py-3 text-rose-600">Super Admin (Full)</SelectItem>}
            </SelectContent>
        </Select>
    );
}
