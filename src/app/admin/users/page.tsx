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

export default async function AdminUsersPage() {
    const role = await getDbRole();
    const superAdmin = await isSuperAdmin();

    if (role !== Role.SUPER_ADMIN && role !== Role.SUB_ADMIN) {
        redirect("/dashboard");
    }

    const users = await getAllUsers() as unknown as UserWithCounts[];

    return (
        <div className="container py-10 px-4 mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground mt-1">Manage platform members, roles, and administrative access.</p>
                </div>
                <div className="flex items-center gap-3">
                    <AddUserModal canManageAdmins={superAdmin} />
                    <Badge variant="outline" className="rounded-full px-4 py-1 gap-2 border-primary/20 bg-primary/5 text-primary">
                        <Shield className="w-3 h-3" />
                        {role.replace("_", " ")}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="rounded-2xl border-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Total Members</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Administrators</CardTitle>
                        <Shield className="w-4 h-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.filter(u => u.role === Role.SUPER_ADMIN || u.role === Role.SUB_ADMIN).length}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Support Agents</CardTitle>
                        <UserCog className="w-4 h-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.filter(u => u.role === Role.AGENT).length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-3xl border-zinc-200 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-zinc-50/50">
                        <TableRow className="hover:bg-transparent border-zinc-100">
                            <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 pl-6">Profile</TableHead>
                            <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4">Role</TableHead>
                            <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 text-center">Tickets</TableHead>
                            <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 text-center">Assigned</TableHead>
                            <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4">Joined</TableHead>
                            {superAdmin && <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 text-right pr-6">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="hover:bg-zinc-50/50 transition-colors border-zinc-100 group">
                                <TableCell className="py-4 pl-6">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">{user.name}</span>
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Mail className="w-2.5 h-2.5" />
                                            {user.email}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <RoleSwitcher userId={user.id} currentRole={user.role} canManageAdmins={superAdmin} />
                                </TableCell>
                                <TableCell className="py-4 text-center font-bold text-zinc-400">{user._count.tickets}</TableCell>
                                <TableCell className="py-4 text-center font-bold text-zinc-400">{user._count.assignedTickets}</TableCell>
                                <TableCell className="py-4 text-[11px] font-medium text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "N/A"}
                                    </span>
                                </TableCell>
                                {superAdmin && (
                                    <TableCell className="py-4 text-right pr-6">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8"
                                            disabled={user.role === Role.SUPER_ADMIN} // Can't delete yourself or other super admins easily here
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
