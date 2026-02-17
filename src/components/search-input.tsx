"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useEffect, useState } from "react";

export function SearchInput({ placeholder = "Search tickets..." }: { placeholder?: string }) {
    const { replace } = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [value, setValue] = useState(searchParams.get("q")?.toString() || "");

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set("q", value);
        } else {
            params.delete("q");
        }

        const timer = setTimeout(() => {
            startTransition(() => {
                replace(`${pathname}?${params.toString()}`);
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [value, pathname, replace, searchParams]);

    return (
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="pl-10 rounded-xl bg-muted/50 border-none focus-visible:ring-primary/20"
                placeholder={placeholder}
            />
            {isPending && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            )}
        </div>
    );
}
