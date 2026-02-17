import { getDashboardTickets } from "@/app/actions/tickets";
import { getDbRole } from "@/lib/roles";
import { KanbanBoard } from "@/components/kanban-board";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { Role, Status, Priority } from "@/lib/constants";
import Link from "next/link";
import { SearchInput } from "@/components/search-input";
import { Badge } from "@/components/ui/badge";

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

    const tickets = await getDashboardTickets({ search: query }) as unknown as TicketData[];

    return (
        <div className="min-h-screen bg-zinc-50/50 flex flex-col animate-in fade-in duration-700">
            {/* Premium Header Section */}
            <div className="bg-zinc-900 text-white pt-16 pb-20 px-4 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
                <div className="container mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <Badge variant="outline" className="border-white/10 bg-white/5 text-primary-foreground/80 rounded-full px-4 py-1 text-[10px] uppercase font-black tracking-[0.2em]">
                                Workflow Management
                            </Badge>
                            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight italic">
                                Ticket Kanban
                            </h1>
                            <p className="text-zinc-400 text-lg font-medium max-w-xl leading-relaxed">
                                Manage the <span className="text-white font-bold">lifecycle of support requests</span> with high-frequency drag-and-drop orchestration.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <SearchInput placeholder="Quick filter boards..." className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 h-14 rounded-2xl w-full md:w-[350px] focus:bg-white focus:text-black transition-all" />
                            <div className="flex items-center gap-2">
                                <Link href="/tickets">
                                    <Button variant="outline" className="rounded-full border-white/10 bg-white/5 hover:bg-white hover:text-black text-white h-14 px-8 font-black transition-all tracking-tight uppercase text-xs">
                                        <List className="w-4 h-4 mr-2" />
                                        List View
                                    </Button>
                                </Link>
                                <Button className="rounded-full bg-primary text-white h-14 px-8 font-black transition-all tracking-tight uppercase text-xs shadow-xl shadow-primary/20">
                                    <LayoutGrid className="w-4 h-4 mr-2" />
                                    Kanban View
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 container mx-auto px-4 -mt-10 relative z-20 pb-10">
                <div className="h-full min-h-[70vh]">
                    <KanbanBoard initialTickets={tickets} />
                </div>
            </div>
        </div>
    );
}
