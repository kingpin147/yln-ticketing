"use client";

import Link from "next/link";
import { UserButton, SignInButton, SignUpButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, PlusCircle, Ticket, LayoutGrid, ShieldCheck } from "lucide-react";
import { Role } from "@/lib/constants";

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 sm:px-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                        <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-sm">YLN</span>
                        <span>Support</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                        <Link href="/my-tickets" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                            <Ticket className="w-4 h-4" />
                            My Tickets
                        </Link>
                        <Link href="/dashboard" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Link>

                        <NavbarLinks />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/tickets/new">
                        <Button size="sm" className="hidden sm:flex gap-2 rounded-full">
                            <PlusCircle className="w-4 h-4" />
                            New Ticket
                        </Button>
                    </Link>

                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button size="sm" variant="ghost" className="rounded-full">Sign In</Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <Button size="sm" className="rounded-full bg-[#6c47ff] text-white hover:bg-[#5a3ae6]">Sign Up</Button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                </div>
            </div>
        </nav>
    );
}
function NavbarLinks() {
    const { user } = useUser();
    const role = user?.publicMetadata?.role as Role | undefined;

    const isStaff = role === Role.AGENT || role === Role.SUB_ADMIN || role === Role.SUPER_ADMIN;
    const isPrivileged = role === Role.SUB_ADMIN || role === Role.SUPER_ADMIN;

    return (
        <>
            {isStaff && (
                <Link href="/tickets/kanban" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <LayoutGrid className="w-4 h-4" />
                    Kanban
                </Link>
            )}
            {isPrivileged && (
                <Link href="/admin/users" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Admin
                </Link>
            )}
        </>
    );
}
