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

export default async function TicketsPage(props: { searchParams: Promise<{ q?: string }> }) {
    const searchParams = await props.searchParams;
    const query = searchParams.q;
    const role = await getDbRole();

    // Staff only page
    if (role === Role.SUBMITTER) {
        redirect("/my-tickets");
    }

    // Admins see all, Agents see assigned (handled by getDashboardTickets logic)
    const tickets = await getDashboardTickets(query) as unknown as TicketItem[];

    return (
        <div className="container py-10 px-4 mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Global Tickets</h1>
                    <p className="text-muted-foreground mt-1">Manage all support requests in the system.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <SearchInput placeholder="Search ID or title..." />
                    <ExportButton data={tickets} />
                    <Link href="/tickets/kanban">
                        <Button variant="outline" size="sm" className="rounded-full gap-2">
                            <LayoutGrid className="w-4 h-4" />
                            Kanban board
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="rounded-3xl overflow-hidden border-zinc-200 shadow-sm">
                <Table>
                    <TableHeader className="bg-zinc-50/50">
                        <TableRow className="hover:bg-transparent border-zinc-100">
                            <TableHead className="w-[120px] font-bold uppercase text-[11px] tracking-wider py-4">ID</TableHead>
                            <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4">Title</TableHead>
                            <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4">Status</TableHead>
                            <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4">Priority</TableHead>
                            <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4">Requester</TableHead>
                            <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 text-right pr-6">Submitted</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                                    <p className="font-medium">No tickets matching your search.</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            tickets.map((ticket) => (
                                <TableRow key={ticket.id} className="hover:bg-zinc-50/50 transition-colors cursor-pointer border-zinc-100 group">
                                    <TableCell className="font-mono font-bold text-primary py-4">
                                        <Link href={`/tickets/${ticket.id}`} className="block">
                                            {ticket.ticketId}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="font-semibold py-4">
                                        <Link href={`/tickets/${ticket.id}`} className="block truncate max-w-[250px]">
                                            {ticket.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <Badge variant={ticket.status === "RESOLVED" || ticket.status === "CLOSED" ? "outline" : "default"}
                                            className="rounded-full px-3 py-0.5 text-[10px] font-bold">
                                            {ticket.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-[10px] font-bold border-none ${ticket.priority === "URGENT" ? "bg-red-100 text-red-700" :
                                            ticket.priority === "HIGH" ? "bg-orange-100 text-orange-700" :
                                                ticket.priority === "MEDIUM" ? "bg-blue-100 text-blue-700" :
                                                    "bg-zinc-200 text-zinc-700"
                                            }`}>
                                            {ticket.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-4 text-sm font-medium">
                                        {ticket.submittedBy?.name || "Unknown"}
                                    </TableCell>
                                    <TableCell className="text-right pr-6 text-muted-foreground text-sm py-4">
                                        {ticket.createdAt ? format(new Date(ticket.createdAt), "MMM d, HH:mm") : "N/A"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
