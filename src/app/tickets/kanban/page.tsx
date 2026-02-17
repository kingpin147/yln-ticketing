import { getDashboardTickets } from "@/app/actions/tickets";
import { getDbRole } from "@/lib/roles";
import { KanbanBoard } from "@/components/kanban-board";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { Role, Status, Priority } from "@/lib/constants";
import Link from "next/link";
import { SearchInput } from "@/components/search-input";

interface TicketData {
    id: string;
    ticketId: string;
    title: string;
    status: Status;
    priority: Priority;
    department: string | null;
    submittedBy: { name: string | null };
}

export default async function KanbanPage(props: { searchParams: Promise<{ q?: string }> }) {
    const searchParams = await props.searchParams;
    const query = searchParams.q;
    const role = await getDbRole();

    if (role !== Role.AGENT && role !== Role.SUPER_ADMIN && role !== Role.SUB_ADMIN) {
        redirect("/dashboard");
    }

    const tickets = await getDashboardTickets(query) as unknown as TicketData[];

    return (
        <div className="container py-10 px-4 mx-auto space-y-8 h-screen flex flex-col overflow-hidden">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Ticket Kanban</h1>
                    <p className="text-muted-foreground mt-1 tracking-tight">Manage the lifecycle of support requests with drag-and-drop.</p>
                </div>
                <div className="flex items-center gap-3">
                    <SearchInput placeholder="Filter board..." />
                    <div className="flex items-center gap-2">
                        <Link href="/tickets">
                            <Button variant="outline" size="sm" className="rounded-full gap-2">
                                <List className="w-4 h-4" />
                                List View
                            </Button>
                        </Link>
                        <Button variant="default" size="sm" className="rounded-full gap-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                            <LayoutGrid className="w-4 h-4" />
                            Kanban board
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <KanbanBoard initialTickets={tickets} />
            </div>
        </div>
    );
}
