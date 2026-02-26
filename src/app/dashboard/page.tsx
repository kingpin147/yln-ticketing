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

    const tickets = await getDashboardTickets({ search: query }) as unknown as TicketStats[];
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
        <div className="min-h-screen bg-zinc-50/50 pb-20 animate-in fade-in duration-700">
            {/* Refined Header Section */}
            <div className="bg-white border-b border-zinc-200 text-zinc-900 pt-16 pb-24 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-64 -mt-64" />

                <div className="container mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary rounded-full px-4 py-1 text-[10px] uppercase font-black tracking-[0.2em]">
                                Platform Overview
                            </Badge>
                            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight text-zinc-900">
                                Hey, {dbUser?.name?.split(' ')[0] || "there"}! 👋
                            </h1>
                            <p className="text-zinc-500 text-lg font-medium max-w-xl leading-relaxed">
                                Welcome back to <span className="text-primary font-bold">YLN Support</span>.
                                There are <span className="text-zinc-900 font-bold">{stats.total} total requests</span> in the system.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <SearchInput placeholder="Quick find ticket..." className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 h-12 rounded-2xl w-full md:w-[300px] focus:bg-white transition-all shadow-sm" />
                            {(role === Role.AGENT || role === Role.SUPER_ADMIN || role === Role.SUB_ADMIN) && (
                                <div className="flex items-center gap-2">
                                    <ExportButton data={tickets} />
                                    <Link href="/tickets">
                                        <Button variant="outline" className="rounded-full border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 h-12 px-6 font-bold transition-all shadow-sm">
                                            <List className="w-4 h-4 mr-2" />
                                            List View
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-12 relative z-20">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="rounded-[2rem] border-none shadow-2xl bg-white p-2">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-zinc-100 rounded-2xl text-zinc-900 group-hover:scale-110 transition-transform">
                                    <Ticket className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Volume</span>
                            </div>
                            <div className="text-4xl font-black tracking-tighter">{stats.total}</div>
                            <p className="text-xs text-zinc-500 font-bold mt-1 uppercase tracking-tight">Active Tickets</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-none shadow-2xl bg-white p-2">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Processing</span>
                            </div>
                            <div className="text-4xl font-black tracking-tighter text-blue-600">{stats.open}</div>
                            <p className="text-xs text-blue-500/70 font-bold mt-1 uppercase tracking-tight">Requires Attention</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-none shadow-2xl bg-white p-2">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Success Rate</span>
                            </div>
                            <div className="text-4xl font-black tracking-tighter text-emerald-600">{stats.resolved}</div>
                            <p className="text-xs text-emerald-500/70 font-bold mt-1 uppercase tracking-tight">Resolved Tasks</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-none shadow-2xl bg-white p-2">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Priority 1</span>
                            </div>
                            <div className="text-4xl font-black tracking-tighter text-rose-600">{stats.urgent}</div>
                            <p className="text-xs text-rose-500/70 font-bold mt-1 uppercase tracking-tight">Critical Issues</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-12">
                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="rounded-[2.5rem] border border-zinc-100 shadow-xl bg-white overflow-hidden">
                            <CardHeader className="bg-zinc-50 px-8 py-6 border-b border-zinc-100 flex flex-row items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <CardTitle className="text-xl font-black tracking-tight text-zinc-900 uppercase">Recent Activity</CardTitle>
                                    </div>
                                    <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Live System Pulse</p>
                                </div>
                                <Link href="/my-tickets">
                                    <Button variant="outline" className="rounded-full border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 px-6 font-bold transition-all shadow-sm">
                                        View All
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="space-y-3">
                                    {tickets.slice(0, 10).map((ticket: TicketStats) => (
                                        <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="flex items-center justify-between p-5 rounded-3xl bg-zinc-50/50 hover:bg-zinc-100/80 transition-all group border border-zinc-100/50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-xs text-zinc-400 border border-zinc-100 group-hover:text-primary transition-colors">
                                                    {ticket.ticketId.split('-')[1]}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="font-black text-zinc-800 tracking-tight group-hover:text-primary transition-colors">{ticket.title}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{ticket.ticketId}</span>
                                                        <div className="w-1 h-1 rounded-full bg-zinc-300" />
                                                        <Badge variant="outline" className={`rounded-xl border-none text-[9px] font-black px-2 py-0 h-4 uppercase ${ticket.priority === "URGENT" ? "bg-rose-100 text-rose-700" :
                                                            ticket.priority === "HIGH" ? "bg-orange-100 text-orange-700" :
                                                                ticket.priority === "MEDIUM" ? "bg-sky-100 text-sky-700" :
                                                                    "bg-zinc-200 text-zinc-700"
                                                            }`}>
                                                            {ticket.priority}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant={ticket.status === "RESOLVED" || ticket.status === "CLOSED" ? "outline" : "default"}
                                                className={`rounded-xl px-4 py-1 text-[10px] font-black uppercase tracking-wider h-8 shadow-sm transition-colors ${ticket.status === "RESOLVED" || ticket.status === "CLOSED" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-primary text-primary-foreground"}`}>
                                                {ticket.status}
                                            </Badge>
                                        </Link>
                                    ))}
                                    {tickets.length === 0 && (
                                        <div className="py-20 text-center space-y-4">
                                            <div className="w-20 h-20 bg-zinc-100 rounded-[2rem] mx-auto flex items-center justify-center">
                                                <Ticket className="w-8 h-8 text-zinc-300" />
                                            </div>
                                            <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">No activity records found</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Widgets */}
                    <div className="space-y-10">
                        {(role === Role.AGENT || role === Role.SUPER_ADMIN || role === Role.SUB_ADMIN) && (
                            <>
                                {/* Unassigned Tickets */}
                                <Card className="rounded-[2.5rem] border border-secondary/10 shadow-xl bg-white overflow-hidden p-2">
                                    <div className="bg-secondary px-6 py-6 text-white rounded-[2rem] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                                        <CardTitle className="text-sm font-black flex items-center gap-3 uppercase tracking-widest">
                                            <ShieldAlert className="w-5 h-5" />
                                            Pending Assignment
                                        </CardTitle>
                                        <div className="text-3xl font-black mt-2 tracking-tighter">{unassigned.length} Issues</div>
                                    </div>
                                    <CardContent className="pt-6 px-4 pb-4">
                                        <div className="space-y-3">
                                            {unassigned.slice(0, 3).map(t => (
                                                <Link key={t.id} href={`/tickets/${t.id}`} className="block p-4 rounded-2xl bg-secondary/5 border border-secondary/10 hover:bg-secondary/10 transition-all group">
                                                    <p className="text-sm font-black text-secondary group-hover:text-secondary/80 transition-colors uppercase tracking-tight truncate">{t.title}</p>
                                                    <p className="text-[10px] font-black italic text-secondary/40 mt-1">{t.ticketId}</p>
                                                </Link>
                                            ))}
                                            {unassigned.length === 0 && (
                                                <div className="py-8 text-center bg-zinc-50 rounded-2xl">
                                                    <p className="text-xs font-black uppercase text-zinc-400 tracking-widest">Clear Queue 🎉</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Assigned to Me */}
                                <Card className="rounded-[2.5rem] border border-primary/10 shadow-xl bg-white overflow-hidden p-2">
                                    <div className="bg-primary px-6 py-6 text-white rounded-[2rem] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                                        <CardTitle className="text-sm font-black flex items-center gap-3 uppercase tracking-widest">
                                            <UserCheck className="w-5 h-5" />
                                            My Active Work
                                        </CardTitle>
                                        <div className="text-3xl font-black mt-2 tracking-tighter">{myAssigned.length} Tasks</div>
                                    </div>
                                    <CardContent className="pt-6 px-4 pb-4">
                                        <div className="space-y-3">
                                            {myAssigned.slice(0, 3).map(t => (
                                                <Link key={t.id} href={`/tickets/${t.id}`} className="block p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all group">
                                                    <p className="text-sm font-black text-primary group-hover:text-primary/80 transition-colors uppercase tracking-tight truncate">{t.title}</p>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <p className="text-[10px] font-black italic text-primary/40">{t.ticketId}</p>
                                                        <Badge variant="outline" className="text-[9px] font-black border-primary/20 bg-white/50 text-primary rounded-lg h-5 italic uppercase">{t.status}</Badge>
                                                    </div>
                                                </Link>
                                            ))}
                                            {myAssigned.length === 0 && (
                                                <div className="py-8 text-center bg-zinc-50 rounded-2xl">
                                                    <p className="text-xs font-black uppercase text-zinc-400 tracking-widest">No Active Work</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {/* User Quick Tip */}
                        {role === Role.SUBMITTER && (
                            <Card className="rounded-[3rem] border border-primary/10 bg-white text-zinc-900 p-10 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                                <h3 className="font-black text-3xl mb-4 tracking-tighter leading-tight">Need immediate technical help?</h3>
                                <p className="text-zinc-500 font-medium mb-8 leading-relaxed">Our average resolution time is <span className="text-primary font-bold">12 hours</span>. You'll receive real-time alerts as we progress.</p>
                                <Link href="/tickets/new">
                                    <Button className="w-full bg-primary text-white hover:bg-primary/90 font-black rounded-2xl h-14 text-lg shadow-xl shadow-primary/10 transition-transform hover:scale-[1.02]">
                                        Submit Ticket
                                    </Button>
                                </Link>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
