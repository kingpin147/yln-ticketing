import { getTicketById } from "@/app/actions/tickets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ArrowLeft, User, Calendar, Tag, Shield, History, MessageSquare, Lock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/comment-form";
import { getDbRole } from "@/lib/roles";
import { Role } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const ticket = await getTicketById(id);
    const userRole = await getDbRole();

    if (!ticket) {
        notFound();
    }

    const isStaff = userRole === Role.AGENT || userRole === Role.SUB_ADMIN || userRole === Role.SUPER_ADMIN;
    const visibleComments = ticket.comments.filter(c => !c.isPrivate || isStaff);

    return (
        <div className="container max-w-5xl py-10 px-4 mx-auto space-y-8 animate-in fade-in duration-500">
            <Link href="/my-tickets">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Tickets
                </Button>
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm font-bold bg-primary/10 text-primary px-2 py-1 rounded">
                            {ticket.ticketId}
                        </span>
                        <Badge variant="default" className="rounded-full px-3">{ticket.status}</Badge>
                        <Badge variant="outline" className={`rounded-full px-3 border-none ${ticket.priority === "URGENT" ? "bg-red-100 text-red-700" :
                            ticket.priority === "HIGH" ? "bg-orange-100 text-orange-700" :
                                ticket.priority === "MEDIUM" ? "bg-blue-100 text-blue-700" :
                                    "bg-zinc-100 text-zinc-700"
                            }`}>
                            {ticket.priority}
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">{ticket.title}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded-3xl border-zinc-200 overflow-hidden shadow-sm">
                        <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-6 px-8">
                            <CardTitle className="text-xl font-bold">Issue Description</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 whitespace-pre-wrap leading-relaxed text-zinc-700 text-lg">
                            {ticket.description}
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="discussion" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 rounded-2xl p-1 bg-zinc-100/50 border border-zinc-200 mb-6">
                            <TabsTrigger value="discussion" className="rounded-xl flex items-center gap-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <MessageSquare className="w-4 h-4" />
                                Discussion
                            </TabsTrigger>
                            <TabsTrigger value="history" className="rounded-xl flex items-center gap-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <History className="w-4 h-4" />
                                Activity Log
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="discussion">
                            <Card className="rounded-3xl border-zinc-200 overflow-hidden shadow-sm">
                                <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-6 px-8 flex flex-row items-center justify-between">
                                    <div className="flex flex-col">
                                        <CardTitle className="text-xl font-bold font-display">Discussion</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1">Communicate with agents and stay updated.</p>
                                    </div>
                                    <Badge variant="secondary" className="rounded-full">{visibleComments.length} Comments</Badge>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="space-y-10">
                                        <CommentForm ticketId={ticket.id} isStaff={isStaff} />

                                        <div className="space-y-8">
                                            {visibleComments.length === 0 ? (
                                                <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                                                    <p className="text-muted-foreground text-sm">No discussion on this ticket yet.</p>
                                                </div>
                                            ) : (
                                                visibleComments.map((comment) => (
                                                    <div key={comment.id} className={`flex gap-4 p-6 rounded-3xl border transition-all ${comment.isPrivate ? "bg-orange-50/50 border-orange-100 ring-1 ring-orange-100" : "bg-zinc-50/30 border-transparent hover:border-zinc-100"}`}>
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border shadow-sm ${comment.isPrivate ? "bg-white text-orange-600 border-orange-200" : "bg-white text-zinc-500 border-zinc-200"}`}>
                                                            {comment.isPrivate ? <Lock className="w-4 h-4" /> : <User className="w-5 h-5" />}
                                                        </div>
                                                        <div className="grid gap-2 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm tracking-tight">{comment.user.name}</span>
                                                                <span className="text-xs text-muted-foreground">{format(new Date(comment.createdAt), "MMM d, h:mm a")}</span>
                                                                {comment.isPrivate && (
                                                                    <Badge variant="outline" className="text-[9px] uppercase font-bold text-orange-600 border-orange-200 bg-white ml-2">
                                                                        Internal ONLY
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-zinc-700 leading-relaxed pt-1">
                                                                {comment.content}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history">
                            <Card className="rounded-3xl border-zinc-200 overflow-hidden shadow-sm">
                                <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-6 px-8">
                                    <div className="flex flex-col">
                                        <CardTitle className="text-xl font-bold font-display">Activity Log</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1">Full audit trail of status changes and actions.</p>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-zinc-100 before:via-zinc-100 before:to-transparent">
                                        {ticket.activityLogs.length === 0 ? (
                                            <div className="text-center py-12 ml-10 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                                                <p className="text-muted-foreground text-sm">No activity recorded for this ticket.</p>
                                            </div>
                                        ) : (
                                            ticket.activityLogs.map((log) => (
                                                <div key={log.id} className="relative flex items-center justify-between gap-6 ml-10 group">
                                                    <div className="absolute -left-10 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-100 bg-white shadow-sm ring-4 ring-white z-10 transition-transform group-hover:scale-110">
                                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                                    </div>
                                                    <div className="flex flex-1 flex-col p-4 rounded-2xl bg-zinc-50/50 border border-zinc-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[11px] font-bold uppercase tracking-widest text-primary/70">{log.action.replace("_", " ")}</span>
                                                            <span className="text-[10px] text-muted-foreground">{format(new Date(log.createdAt), "MMM d, HH:mm")}</span>
                                                        </div>
                                                        <p className="text-sm font-medium text-zinc-700">{log.details}</p>
                                                        {log.user && (
                                                            <div className="mt-2 flex items-center gap-1.5 pt-2 border-t border-zinc-200/50">
                                                                <div className="w-4 h-4 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden">
                                                                    <User className="w-2.5 h-2.5 text-zinc-500" />
                                                                </div>
                                                                <span className="text-[10px] text-muted-foreground font-medium">by {log.user.name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card className="rounded-3xl border-zinc-200 overflow-hidden shadow-sm sticky top-24">
                        <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-6 px-8">
                            <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Ticket Insights</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-center gap-4 text-sm group">
                                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider leading-none mb-1">Requester</span>
                                    <span className="font-semibold">{ticket.submittedBy.name}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm group">
                                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider leading-none mb-1">Created On</span>
                                    <span className="font-semibold">{format(new Date(ticket.createdAt), "PPP")}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm group">
                                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-purple-50 group-hover:text-purple-500 transition-colors">
                                    <Tag className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider leading-none mb-1">Department</span>
                                    <span className="font-semibold">{ticket.department || "General"}</span>
                                </div>
                            </div>

                            <Separator className="bg-zinc-100" />

                            <div className="flex items-center gap-4 text-sm group">
                                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider leading-none mb-1">Agent Assigned</span>
                                    <span className="font-semibold">{ticket.assignedTo?.name || "Unassigned"}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
