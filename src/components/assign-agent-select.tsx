"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { assignTicket } from "@/app/actions/tickets";
import { toast } from "sonner";
import { User, Loader2, Sparkles, UserPlus } from "lucide-react";
import { Button } from "./ui/button";
import { InviteUserModal } from "./invite-user-modal";

interface Agent {
    id: string;
    name: string | null;
    role: string;
    _count: { assignedTickets: number };
}

export function AssignAgentSelect({
    ticketId,
    currentAgentId,
    agents,
    canManageAdmins
}: {
    ticketId: string;
    currentAgentId?: string | null;
    agents: Agent[];
    canManageAdmins: boolean;
}) {
    const [isPending, setIsPending] = useState(false);

    const handleAssign = async (agentId: string) => {
        if (agentId === currentAgentId) return;

        setIsPending(true);
        try {
            await assignTicket(ticketId, agentId);
            toast.success("Agent assigned successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to assign agent");
        } finally {
            setIsPending(false);
        }
    };

    const autoAssign = async () => {
        if (agents.length === 0) return;

        // Find agent with fewest tickets
        const bestAgent = agents.reduce((prev, curr) =>
            prev._count.assignedTickets <= curr._count.assignedTickets ? prev : curr
        );

        if (bestAgent) {
            handleAssign(bestAgent.id);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary z-10" />
                <Select
                    disabled={isPending}
                    onValueChange={handleAssign}
                    defaultValue={currentAgentId || undefined}
                >
                    <SelectTrigger className="w-full h-12 pl-10 rounded-2xl border-zinc-200 bg-white font-bold text-sm focus:ring-primary/10 transition-all">
                        <SelectValue placeholder="Assign an Agent" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-zinc-200">
                        {agents.length === 0 ? (
                            <div className="p-4 text-xs text-center text-zinc-400 font-bold italic">
                                No staff available.<br />
                                <span className="text-[10px] opacity-70">Invite someone below.</span>
                            </div>
                        ) : (
                            agents.map((agent) => (
                                <SelectItem
                                    key={agent.id}
                                    value={agent.id}
                                    className="rounded-xl font-medium focus:bg-primary/5 focus:text-primary py-3"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="font-bold">{agent.name}</span>
                                            <span className="text-[9px] font-black uppercase text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
                                                {agent._count.assignedTickets} Active
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-black uppercase text-primary/60 tracking-widest leading-none">
                                            {agent.role.replace("_", " ")}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
                {isPending && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2">
                <Button
                    variant="outline"
                    onClick={autoAssign}
                    disabled={isPending || agents.length === 0}
                    className="rounded-2xl h-10 border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 font-black text-[9px] uppercase tracking-widest gap-2 transition-all shadow-sm"
                >
                    <Sparkles className="w-3 h-3" />
                    Auto-Assign
                </Button>

                <InviteUserModal canManageAdmins={canManageAdmins} isCompact />
            </div>
        </div>
    );
}
