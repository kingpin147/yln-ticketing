import { getAllUsers, deleteUser } from "@/app/actions/admin";
import { getDbRole, isSuperAdmin } from "@/lib/roles";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RoleSwitcher } from "@/components/role-switcher";
import { AddUserModal } from "@/components/add-user-modal";
import { Role } from "@/lib/constants";
import { Users, Shield, UserCog, Mail, Calendar, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface UserWithCounts {
    id: string;
    name: string | null;
    email: string | null;
    role: Role;
    createdAt: Date;
    _count: {
        tickets: number;
        assignedTickets: number;
    }
}

import { UserFilters } from "@/components/user-filters";
import { SearchInput } from "@/components/search-input";

export default async function AdminUsersPage(props: {
    searchParams: Promise<{ q?: string; role?: Role }>
}) {
    const searchParams = await props.searchParams;
    const query = searchParams.q;
    const filterRole = searchParams.role;

    const role = await getDbRole();
    const superAdmin = await isSuperAdmin();

    if (role !== Role.SUPER_ADMIN && role !== Role.SUB_ADMIN) {
        redirect("/dashboard");
    }

    const users = await getAllUsers({ search: query, role: filterRole }) as unknown as UserWithCounts[];

    return (
        <div className="min-h-screen bg-zinc-50/50 pb-20 animate-in fade-in duration-700">
            {/* Premium Header Section */}
            <div className="bg-zinc-900 text-white pt-16 pb-24 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
                <div className="container mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <Badge variant="outline" className="border-white/10 bg-white/5 text-primary-foreground/80 rounded-full px-4 py-1 text-[10px] uppercase font-black tracking-[0.2em] backdrop-blur-md">
                                Platform Control
                            </Badge>
                            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight italic">
                                Access Control
                            </h1>
                            <p className="text-zinc-400 text-lg font-medium max-w-xl leading-relaxed">
                                Manage platform <span className="text-white font-bold">members, roles</span>, and administrative safety.
                                High-visibility governance for {role.replace("_", " ")}s.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <UserFilters />
                            <SearchInput placeholder="Search name or email..." className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 h-12 rounded-2xl w-full md:w-[280px] focus:bg-white focus:text-black transition-all" />
                            <AddUserModal canManageAdmins={superAdmin} />
                            <Badge variant="outline" className="rounded-full px-6 py-2 gap-2 border-white/10 bg-white/5 text-primary-foreground font-black uppercase text-[10px] tracking-widest backdrop-blur-md h-12">
                                <Shield className="w-4 h-4 text-primary" />
                                {role.replace("_", " ")}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-12 relative z-20">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="rounded-[2rem] border-none shadow-2xl bg-white p-2">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-zinc-100 rounded-2xl text-zinc-900 group-hover:scale-110 transition-transform">
                                    <Users className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Governance</span>
                            </div>
                            <div className="text-4xl font-black tracking-tighter">{users.length} Profiles</div>
                            <p className="text-xs text-zinc-500 font-bold mt-1 uppercase tracking-tight">Total Platform Members</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-none shadow-2xl bg-white p-2">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Privileged</span>
                            </div>
                            <div className="text-4xl font-black tracking-tighter text-zinc-900">{users.filter(u => u.role === Role.SUPER_ADMIN || u.role === Role.SUB_ADMIN).length} Admins</div>
                            <p className="text-xs text-primary font-bold mt-1 uppercase tracking-tight">Active Administrators</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-none shadow-2xl bg-white p-2">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                    <UserCog className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Frontline</span>
                            </div>
                            <div className="text-4xl font-black tracking-tighter text-blue-600">{users.filter(u => u.role === Role.AGENT).length} Agents</div>
                            <p className="text-xs text-blue-500/70 font-bold mt-1 uppercase tracking-tight">Support Personnel</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-[2.5rem] mt-10 overflow-hidden border-none shadow-2xl bg-white">
                    <Table>
                        <TableHeader className="bg-zinc-900">
                            <TableRow className="hover:bg-transparent border-none h-16">
                                <TableHead className="font-black uppercase text-[10px] tracking-[0.15em] pl-10 text-zinc-400 italic">User Profile</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-[0.15em] text-zinc-400 italic">Level / Role</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-[0.15em] text-zinc-400 italic text-center">Volume</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-[0.15em] text-zinc-400 italic text-center">Active</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-[0.15em] text-zinc-400 italic">Membership</TableHead>
                                {superAdmin && <TableHead className="font-black uppercase text-[10px] tracking-[0.15em] text-zinc-400 italic text-right pr-10">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-zinc-50 transition-colors border-zinc-100 group h-24">
                                    <TableCell className="pl-10">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-black text-sm text-zinc-800 tracking-tight group-hover:translate-x-1 transition-transform">{user.name}</span>
                                            <span className="text-[10px] font-black text-zinc-400 flex items-center gap-1 uppercase tracking-widest italic leading-none">
                                                <Mail className="w-2.5 h-2.5" />
                                                {user.email}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <RoleSwitcher userId={user.id} currentRole={user.role} canManageAdmins={superAdmin} />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="font-black text-lg text-zinc-300 group-hover:text-zinc-500 transition-colors">{user._count.tickets}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="font-black text-lg text-zinc-300 group-hover:text-blue-500 transition-colors">{user._count.assignedTickets}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-zinc-800 uppercase tracking-tighter">
                                                {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "N/A"}
                                            </span>
                                            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest italic leading-none mt-1">Verified Member</span>
                                        </div>
                                    </TableCell>
                                    {superAdmin && (
                                        <TableCell className="text-right pr-10">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-zinc-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl h-10 w-10 transition-all border border-transparent hover:border-rose-100"
                                                disabled={user.role === Role.SUPER_ADMIN}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
}
