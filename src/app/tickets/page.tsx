import { getDashboardTickets } from "@/app/actions/tickets";
import { getDbRole } from "@/lib/roles";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutGrid, PlusCircle } from "lucide-react";
import { SearchInput } from "@/components/search-input";
import { Role, Status, Priority } from "@/lib/constants";
import { ExportButton } from "@/components/export-button";
import { redirect } from "next/navigation";

import { TicketFilters } from "@/components/ticket-filters";

interface TicketItem {
    id: string;
    ticketId: string;
    title: string;
    status: Status;
    priority: Priority;
    createdAt: Date | string;
    submittedBy: { name: string | null };
    assignedTo: { name: string | null } | null;
}

export default async function TicketsPage(props: {
    searchParams: Promise<{
        q?: string;
        status?: Status;
        priority?: Priority;
        department?: string;
    }>
}) {
    const searchParams = await props.searchParams;
    const query = searchParams.q;
    const status = searchParams.status;
    const priority = searchParams.priority;
    const department = searchParams.department;

    const role = await getDbRole();

    // Staff only page
    if (role === Role.SUBMITTER) {
        redirect("/my-tickets");
    }

    // Admins see all, Agents see assigned (handled by getDashboardTickets logic)
    const tickets = await getDashboardTickets({
        search: query,
        status,
        priority,
        department
    }) as unknown as TicketItem[];

    return (
        <div className="min-h-screen bg-zinc-50/50 pb-20 animate-in fade-in duration-700">
            {/* Premium Header Section */}
            <div className="bg-white border-b border-zinc-200 text-zinc-900 pt-16 pb-24 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-64 -mt-64" />
                <div className="container mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <Badge variant="outline" className="border-zinc-200 bg-zinc-100 text-zinc-500 rounded-full px-4 py-1 text-[10px] uppercase font-black tracking-[0.2em]">
                                Administration
                            </Badge>
                            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight italic">
                                Global Tickets
                            </h1>
                            <p className="text-zinc-400 text-lg font-medium max-w-xl leading-relaxed">
                                Manage and monitor all <span className="text-primary font-bold">active support requests</span>.
                                High-efficiency central monitoring for staff.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <TicketFilters />
                            <SearchInput placeholder="Search ID or title..." className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 h-14 rounded-2xl w-full md:w-[350px] focus:bg-white transition-all shadow-sm" />
                            <div className="flex items-center gap-2">
                                <ExportButton data={tickets} />
                                <Link href="/tickets/kanban">
                                    <Button variant="outline" className="rounded-full border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 h-14 px-8 font-black transition-all tracking-tight uppercase text-xs shadow-sm">
                                        <LayoutGrid className="w-4 h-4 mr-2" />
                                        Kanban board
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-12 relative z-20">
                <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-2xl bg-white">
                    <Table>
                        <TableHeader className="bg-zinc-900">
                            <TableRow className="hover:bg-transparent border-none h-16">
                                <TableHead className="w-[140px] font-black uppercase text-[10px] tracking-[0.15em] pl-10 text-zinc-400 italic">ID Code</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-[0.15em] text-zinc-400 italic">Title & Subject</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-[0.15em] text-zinc-400 italic">Lifecycle</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-[0.15em] text-zinc-400 italic">Priority</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-[0.15em] text-zinc-400 italic">Requester</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-[0.15em] text-zinc-400 italic text-right pr-10">Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tickets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center">
                                                <PlusCircle className="w-6 h-6 text-zinc-300" />
                                            </div>
                                            <p className="font-black uppercase tracking-widest text-xs text-zinc-400">No data records found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tickets.map((ticket) => (
                                    <TableRow key={ticket.id} className="hover:bg-zinc-50 transition-colors border-zinc-100 group h-20">
                                        <TableCell className="pl-10">
                                            <Link href={`/tickets/${ticket.id}`} className="block">
                                                <span className="font-black text-xs text-zinc-400 group-hover:text-primary transition-colors italic tracking-widest">{ticket.ticketId}</span>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/tickets/${ticket.id}`} className="block">
                                                <span className="font-black text-sm text-zinc-800 tracking-tight block truncate max-w-[300px] group-hover:translate-x-1 transition-transform">{ticket.title}</span>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={ticket.status === "RESOLVED" || ticket.status === "CLOSED" ? "outline" : "default"}
                                                className={`rounded-xl px-4 py-1 text-[10px] font-black uppercase tracking-wider h-8 shadow-sm transition-colors ${ticket.status === "RESOLVED" || ticket.status === "CLOSED" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-primary text-primary-foreground"}`}>
                                                {ticket.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`rounded-full px-4 py-1 text-[9px] font-black border-none uppercase tracking-widest italic ${ticket.priority === "URGENT" ? "bg-rose-100 text-rose-700" :
                                                ticket.priority === "HIGH" ? "bg-orange-100 text-orange-700" :
                                                    ticket.priority === "MEDIUM" ? "bg-blue-100 text-blue-700" :
                                                        "bg-zinc-200 text-zinc-700"
                                                }`}>
                                                {ticket.priority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm font-bold text-zinc-600">
                                            {ticket.submittedBy?.name || "Unknown Profile"}
                                        </TableCell>
                                        <TableCell className="text-right pr-10">
                                            <span className="text-zinc-400 font-black text-[10px] uppercase italic">
                                                {ticket.createdAt ? format(new Date(ticket.createdAt), "MMM d, HH:mm") : "N/A"}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
}
