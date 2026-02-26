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
            <div className="flex gap-6 overflow-x-auto pb-12 px-2 snap-x scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
                {COLUMNS.map((column) => {
                    const columnTickets = tickets.filter((t) => t.status === column.id);
                    const columnCount = columnTickets.length;

                    return (
                        <div key={column.id} className="flex flex-col w-[320px] md:w-[350px] shrink-0 snap-start">
                            {/* Column Header */}
                            <div className="mb-4 px-6 py-4 bg-white border border-zinc-100 rounded-2xl shadow-sm">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-black text-sm uppercase tracking-[0.15em] text-zinc-900">
                                        {column.title}
                                    </h3>
                                    <Badge variant="outline" className="rounded-full font-black text-xs bg-zinc-50 text-zinc-500 border-zinc-100">
                                        {columnCount}
                                    </Badge>
                                </div>
                            </div>

                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex flex-col gap-3 p-4 rounded-2xl min-h-[60vh] transition-all ${snapshot.isDraggingOver
                                            ? "bg-primary/5 border-2 border-dashed border-primary/30 shadow-inner"
                                            : "bg-white border-2 border-zinc-100"
                                            }`}
                                    >
                                        {columnTickets.map((ticket, index) => (
                                            <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`animate-in fade-in slide-in-from-top-2 duration-300 ${snapshot.isDragging ? "z-50 rotate-2" : ""
                                                            }`}
                                                    >
                                                        <Card className={`rounded-2xl border-zinc-200 overflow-hidden hover:shadow-lg transition-all cursor-grab active:cursor-grabbing ${snapshot.isDragging
                                                            ? "shadow-2xl ring-4 ring-primary/20 bg-white scale-105"
                                                            : "bg-white shadow-sm hover:border-zinc-300"
                                                            }`}>
                                                            <CardHeader className="p-4 pb-3 bg-zinc-50/50 border-b border-zinc-100">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-[10px] font-black font-mono text-primary bg-primary/5 border border-primary/10 px-2 py-1 rounded-lg">
                                                                        {ticket.ticketId}
                                                                    </span>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`rounded-full border-none text-[9px] font-black px-2.5 py-0.5 shadow-sm ${ticket.priority === "URGENT" ? "bg-rose-500 text-white" :
                                                                            ticket.priority === "HIGH" ? "bg-orange-500 text-white" :
                                                                                ticket.priority === "MEDIUM" ? "bg-primary text-white" :
                                                                                    "bg-zinc-400 text-white"
                                                                            }`}
                                                                    >
                                                                        {ticket.priority}
                                                                    </Badge>
                                                                </div>
                                                                <Link href={`/tickets/${ticket.id}`} className="group">
                                                                    <CardTitle className="text-sm font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                                                        {ticket.title}
                                                                    </CardTitle>
                                                                </Link>
                                                            </CardHeader>
                                                            <CardContent className="p-4 pt-3 space-y-2 bg-white">
                                                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                                    <User className="w-3.5 h-3.5 text-zinc-400" />
                                                                    <span className="truncate font-medium">{ticket.submittedBy.name || "Unknown"}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                                    <Tag className="w-3.5 h-3.5 text-zinc-400" />
                                                                    <span className="truncate font-medium">{ticket.department || "General"}</span>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}

                                        {columnTickets.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <AlertCircle className="w-8 h-8 text-zinc-300 mb-2" />
                                                <p className="text-xs text-muted-foreground font-medium">No tickets here</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
}
