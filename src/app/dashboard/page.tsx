import { getDashboardTickets, getUnassignedTickets, getMyAssignedTickets } from "@/app/actions/tickets";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getDbRole } from "@/lib/roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ticket, Clock, CheckCircle, AlertCircle, LayoutGrid, List, UserCheck, ShieldAlert } from "lucide-react";
import { Status, Priority, Role } from "@/lib/constants";
import Link from "next/link";
import { SearchInput } from "@/components/search-input";
import { ExportButton } from "@/components/export-button";

interface TicketStats {
    id: string;
    ticketId: string;
    title: string;
    status: Status;
    priority: Priority;
}

export default async function DashboardPage(props: { searchParams: Promise<{ q?: string }> }) {
    const searchParams = await props.searchParams;
    const query = searchParams.q;

    const tickets = await getDashboardTickets(query) as unknown as TicketStats[];
    const role = await getDbRole();
    const { userId } = await auth();
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId || "" } });
    const unassigned = await getUnassignedTickets() as unknown as TicketStats[];
    const myAssigned = await getMyAssignedTickets() as unknown as TicketStats[];

    const stats = {
        total: tickets.length,
        open: tickets.filter((t: TicketStats) => t.status !== "RESOLVED" && t.status !== "CLOSED").length,
        resolved: tickets.filter((t: TicketStats) => t.status === "RESOLVED" || t.status === "CLOSED").length,
        urgent: tickets.filter((t: TicketStats) => t.priority === "URGENT").length,
    };

    return (
        <div className="container py-10 px-4 mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, <span className="font-bold text-foreground">{dbUser?.email}</span>. You are logged in as <Badge variant="secondary" className="ml-1 uppercase">{role}</Badge>
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <SearchInput placeholder="Quick find ticket..." />
                    {(role === Role.AGENT || role === Role.SUPER_ADMIN || role === Role.SUB_ADMIN) && (
                        <div className="flex items-center gap-2">
                            <ExportButton data={tickets} />
                            <Link href="/tickets">
                                <Button variant="secondary" size="sm" className="rounded-full gap-2">
                                    <List className="w-4 h-4" />
                                    List View
                                </Button>
                            </Link>
                            <Link href="/tickets/kanban">
                                <Button variant="outline" size="sm" className="rounded-full gap-2">
                                    <LayoutGrid className="w-4 h-4" />
                                    Kanban board
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="rounded-2xl border-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Total Tickets</CardTitle>
                        <Ticket className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Open</CardTitle>
                        <Clock className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">{stats.open}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Resolved</CardTitle>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{stats.resolved}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Urgent</CardTitle>
                        <AlertCircle className="w-4 h-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{stats.urgent}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-3xl border-zinc-200 overflow-hidden shadow-sm">
                        <CardHeader className="border-b bg-zinc-50/50 py-4 px-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Ticket className="w-5 h-5" />
                                Recent Activity
                            </CardTitle>
                            <Link href="/my-tickets">
                                <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-zinc-100">
                                {tickets.slice(0, 10).map((ticket: TicketStats) => (
                                    <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors group">
                                        <div className="space-y-1">
                                            <p className="font-semibold text-sm group-hover:text-primary transition-colors">{ticket.title}</p>
                                            <div className="flex items-center gap-3">
                                                <p className="text-xs text-muted-foreground font-mono">{ticket.ticketId}</p>
                                                <Badge variant="outline" className={`rounded-full text-[9px] font-bold border-none scale-90 ${ticket.priority === "URGENT" ? "bg-red-100 text-red-700" :
                                                    ticket.priority === "HIGH" ? "bg-orange-100 text-orange-700" :
                                                        ticket.priority === "MEDIUM" ? "bg-blue-100 text-blue-700" :
                                                            "bg-zinc-100 text-zinc-700"
                                                    }`}>
                                                    {ticket.priority}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Badge variant={ticket.status === "RESOLVED" || ticket.status === "CLOSED" ? "outline" : "default"}
                                            className="rounded-full text-[10px] font-bold">
                                            {ticket.status}
                                        </Badge>
                                    </Link>
                                ))}
                                {tickets.length === 0 && (
                                    <div className="p-12 text-center text-muted-foreground">
                                        <p className="text-sm">No activity yet.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-8">
                    {(role === Role.AGENT || role === Role.SUPER_ADMIN || role === Role.SUB_ADMIN) && (
                        <>
                            {/* Unassigned Tickets */}
                            <Card className="rounded-3xl border-zinc-200 overflow-hidden border-orange-200 bg-orange-50/10 shadow-sm">
                                <CardHeader className="border-b border-orange-100 bg-orange-50/50 py-4 px-6">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-orange-800">
                                        <ShieldAlert className="w-4 h-4" />
                                        Pending Assignment ({unassigned.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="space-y-2">
                                        {unassigned.slice(0, 3).map(t => (
                                            <Link key={t.id} href={`/tickets/${t.id}`} className="block p-3 rounded-2xl bg-white border border-orange-100 hover:border-orange-300 transition-colors shadow-sm">
                                                <p className="text-sm font-bold truncate mb-1">{t.title}</p>
                                                <p className="text-[10px] font-mono text-orange-600">{t.ticketId}</p>
                                            </Link>
                                        ))}
                                        {unassigned.length === 0 && <p className="text-xs text-center py-4 text-muted-foreground">All tickets assigned! 🎉</p>}
                                        {unassigned.length > 3 && (
                                            <Link href="/tickets/kanban" className="block text-center text-xs font-bold text-orange-700 mt-2 hover:underline">
                                                View remaining {unassigned.length - 3} tickets
                                            </Link>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Assigned to Me */}
                            <Card className="rounded-3xl border-zinc-200 overflow-hidden border-blue-200 bg-blue-50/10 shadow-sm">
                                <CardHeader className="border-b border-blue-100 bg-blue-50/50 py-4 px-6">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-blue-800">
                                        <UserCheck className="w-4 h-4" />
                                        My Active Work ({myAssigned.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="space-y-2">
                                        {myAssigned.slice(0, 3).map(t => (
                                            <Link key={t.id} href={`/tickets/${t.id}`} className="block p-3 rounded-2xl bg-white border border-blue-100 hover:border-blue-300 transition-colors shadow-sm">
                                                <p className="text-sm font-bold truncate mb-1">{t.title}</p>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-[10px] font-mono text-blue-600">{t.ticketId}</p>
                                                    <Badge variant="outline" className="text-[8px] h-3 px-1">{t.status}</Badge>
                                                </div>
                                            </Link>
                                        ))}
                                        {myAssigned.length === 0 && <p className="text-xs text-center py-4 text-muted-foreground">No active assignments.</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {/* User Quick Tip */}
                    {role === Role.SUBMITTER && (
                        <Card className="rounded-3xl border-zinc-200 bg-primary text-primary-foreground p-6 shadow-xl shadow-primary/10">
                            <h3 className="font-bold text-lg mb-2">Need help?</h3>
                            <p className="text-sm text-primary-foreground/80 mb-6 leading-relaxed">Our typical response time is under 12 hours. You'll receive email updates as our team reviews your request.</p>
                            <Link href="/tickets/new">
                                <Button className="w-full bg-white text-primary hover:bg-zinc-100 font-bold rounded-xl h-12">Submit New Ticket</Button>
                            </Link>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
