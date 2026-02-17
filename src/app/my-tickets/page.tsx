import { getMyTickets } from "@/app/actions/tickets";
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
import { PlusCircle } from "lucide-react";
import { SearchInput } from "@/components/search-input";
import { Status, Priority } from "../../../generated/prisma/index.js";

interface TicketItem {
    id: string;
    ticketId: string;
    title: string;
    status: Status;
    priority: Priority;
    createdAt: Date | string;
}

export default async function MyTicketsPage(props: { searchParams: Promise<{ q?: string }> }) {
    const searchParams = await props.searchParams;
    const query = searchParams.q;
    const tickets = await getMyTickets(query) as unknown as TicketItem[];

    return (
        <div className="container py-10 px-4 mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">My Tickets</h1>
                    <p className="text-muted-foreground mt-1">Manage and track your support requests.</p>
                </div>
                <Link href="/tickets/new">
                    <Button className="rounded-full gap-2 shadow-lg shadow-primary/10">
                        <PlusCircle className="w-4 h-4" />
                        New Ticket
                    </Button>
                </Link>
            </div>

            <div className="flex items-center justify-between gap-4">
                <SearchInput placeholder="Search by ID or title..." />
            </div>

            <Card className="rounded-3xl overflow-hidden border-zinc-200 shadow-sm">
                <Table>
                    <TableHeader className="bg-zinc-50/50">
                        <TableRow className="hover:bg-transparent border-zinc-100">
                            <TableHead className="w-[120px] font-bold uppercase text-[11px] tracking-wider py-4">ID</TableHead>
                            <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4">Title</TableHead>
                            <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4">Status</TableHead>
                            <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4">Priority</TableHead>
                            <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4">Submitted</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="font-medium">You haven't submitted any tickets yet.</p>
                                        <Link href="/tickets/new" className="text-primary hover:underline text-sm font-semibold">
                                            Create your first ticket
                                        </Link>
                                    </div>
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
                                    <TableCell className="font-semibold max-w-[300px] truncate py-4">
                                        <Link href={`/tickets/${ticket.id}`} className="block">
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
                                    <TableCell className="text-muted-foreground text-sm py-4">
                                        {format(new Date(ticket.createdAt), "MMM d, yyyy")}
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
