"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Status, Priority } from "@/lib/constants";
import { updateTicketStatus } from "@/app/actions/tickets";
import { toast } from "sonner";
import Link from "next/link";
import { User, Tag, AlertCircle } from "lucide-react";

interface Ticket {
    id: string;
    ticketId: string;
    title: string;
    status: Status;
    priority: Priority;
    department: string | null;
    submittedBy: { name: string | null };
}

interface KanbanBoardProps {
    initialTickets: Ticket[];
}

const COLUMNS: { id: Status; title: string }[] = [
    { id: Status.NEW, title: "New" },
    { id: Status.IN_PROGRESS, title: "In Progress" },
    { id: Status.WAITING, title: "Waiting" },
    { id: Status.RESOLVED, title: "Resolved" },
    { id: Status.CLOSED, title: "Closed" },
];

export function KanbanBoard({ initialTickets }: KanbanBoardProps) {
    const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatus = destination.droppableId as Status;
        const ticketId = draggableId;

        // Optimistic update
        const updatedTickets = tickets.map((t) =>
            t.id === ticketId ? { ...t, status: newStatus } : t
        );
        setTickets(updatedTickets);

        try {
            await updateTicketStatus(ticketId, newStatus);
            toast.success(`Ticket moved to ${newStatus.replace("_", " ")}`);
        } catch (error) {
            setTickets(tickets); // Revert on failure
            toast.error("Failed to update ticket status");
            console.error(error);
        }
    };

    if (!isClient) return <div className="p-8 text-center text-muted-foreground">Loading Kanban...</div>;

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-8 min-h-[calc(100vh-250px)]">
                {COLUMNS.map((column) => (
                    <div key={column.id} className="flex flex-col w-80 shrink-0 gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-sm uppercase tracking-[0.15em] text-muted-foreground">
                                {column.title}
                                <Badge variant="secondary" className="ml-2 rounded-full font-bold">
                                    {tickets.filter((t) => t.status === column.id).length}
                                </Badge>
                            </h3>
                        </div>

                        <Droppable droppableId={column.id}>
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={`flex flex-col gap-4 p-2 rounded-3xl min-h-[200px] transition-colors ${snapshot.isDraggingOver ? "bg-primary/5 border-2 border-dashed border-primary/20" : "bg-zinc-50/50"
                                        }`}
                                >
                                    {tickets
                                        .filter((t) => t.status === column.id)
                                        .map((ticket, index) => (
                                            <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`animate-in fade-in slide-in-from-top-2 duration-300 ${snapshot.isDragging ? "z-50" : ""
                                                            }`}
                                                    >
                                                        <Card className={`rounded-2xl border-zinc-200 overflow-hidden hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${snapshot.isDragging ? "shadow-xl ring-2 ring-primary/20 bg-white" : "bg-card"
                                                            }`}>
                                                            <CardHeader className="p-4 pb-2">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-[10px] font-bold font-mono text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                                                                        {ticket.ticketId}
                                                                    </span>
                                                                    <Badge variant="outline" className={`rounded-full border-none text-[9px] font-bold px-2 py-0 ${ticket.priority === "URGENT" ? "bg-red-100 text-red-700" :
                                                                        ticket.priority === "HIGH" ? "bg-orange-100 text-orange-700" :
                                                                            ticket.priority === "MEDIUM" ? "bg-blue-100 text-blue-700" :
                                                                                "bg-zinc-100 text-zinc-700"
                                                                        }`}>
                                                                        {ticket.priority}
                                                                    </Badge>
                                                                </div>
                                                                <Link href={`/tickets/${ticket.id}`} className="hover:underline">
                                                                    <CardTitle className="text-sm font-bold leading-tight line-clamp-2">
                                                                        {ticket.title}
                                                                    </CardTitle>
                                                                </Link>
                                                            </CardHeader>
                                                            <CardContent className="p-4 pt-2 space-y-3">
                                                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                                    <User className="w-3 h-3" />
                                                                    <span className="truncate">{ticket.submittedBy.name || "Unknown"}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                                    <Tag className="w-3 h-3" />
                                                                    <span className="truncate">{ticket.department || "General"}</span>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
}
