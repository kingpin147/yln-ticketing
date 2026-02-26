"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Role } from "@/lib/constants";
import { Filter } from "lucide-react";

export function UserFilters() {
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
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 border border-zinc-200 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500 mr-2">
                <Filter className="w-3 h-3" />
                Filter Access
            </div>

            <Select
                defaultValue={searchParams.get("role") || "ALL"}
                onValueChange={(v) => updateFilter("role", v)}
            >
                <SelectTrigger className="w-[150px] h-10 rounded-full text-[10px] font-black uppercase tracking-tight bg-white border-zinc-200 text-zinc-900 transition-all focus:ring-primary/20 hover:bg-zinc-50 shadow-sm">
                    <SelectValue placeholder="Access Role" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white">
                    <SelectItem value="ALL" className="rounded-xl font-bold py-2">Any Level</SelectItem>
                    {Object.values(Role).map((role) => (
                        <SelectItem key={role} value={role} className="rounded-xl font-bold py-2">
                            {role.replace("_", " ")}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
