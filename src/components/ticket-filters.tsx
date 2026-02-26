"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Status, Priority } from "@/lib/constants";
import { Filter } from "lucide-react";

export function TicketFilters() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== "ALL") {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-full text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 border border-zinc-200 shadow-sm">
                <Filter className="w-3.5 h-3.5" />
                Filters
            </div>

            <Select
                defaultValue={searchParams.get("status") || "ALL"}
                onValueChange={(v) => updateFilter("status", v)}
            >
                <SelectTrigger className="w-[140px] h-11 rounded-full text-[11px] font-bold uppercase tracking-tight bg-white border-zinc-200 shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white">
                    <SelectItem value="ALL" className="rounded-xl font-bold py-2.5 text-xs">All Status</SelectItem>
                    {Object.values(Status).map((status) => (
                        <SelectItem key={status} value={status} className="rounded-xl font-bold py-2.5 text-xs">
                            {status.replace("_", " ")}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                defaultValue={searchParams.get("priority") || "ALL"}
                onValueChange={(v) => updateFilter("priority", v)}
            >
                <SelectTrigger className="w-[140px] h-11 rounded-full text-[11px] font-bold uppercase tracking-tight bg-white border-zinc-200 shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white">
                    <SelectItem value="ALL" className="rounded-xl font-bold py-2.5 text-xs">All Priority</SelectItem>
                    {Object.values(Priority).map((priority) => (
                        <SelectItem key={priority} value={priority} className="rounded-xl font-bold py-2.5 text-xs">
                            {priority}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
