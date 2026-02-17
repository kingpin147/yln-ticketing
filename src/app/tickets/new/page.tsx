"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createTicket } from "@/app/actions/tickets";
import { useState, useTransition } from "react";
import { Priority } from "@/lib/constants";

const formSchema = z.object({
    title: z.string().min(5, {
        message: "Title must be at least 5 characters.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    priority: z.nativeEnum(Priority),
    department: z.string().min(2, {
        message: "Department is required.",
    }),
});

export default function NewTicketPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: Priority.MEDIUM,
            department: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            try {
                await createTicket(values);
                toast.success("Ticket submitted successfully!");
                router.push("/my-tickets");
            } catch (error: any) {
                toast.error(error?.message || "Something went wrong. Please try again.");
            }
        });
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 pb-20 animate-in fade-in duration-700">
            {/* Premium Header Section */}
            <div className="bg-zinc-900 text-white pt-16 pb-24 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
                <div className="container mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <Badge variant="outline" className="border-white/10 bg-white/5 text-primary-foreground/80 rounded-full px-4 py-1 text-[10px] uppercase font-black tracking-[0.2em]">
                                Support Service
                            </Badge>
                            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight italic">
                                New Request
                            </h1>
                            <p className="text-zinc-400 text-lg font-medium max-w-xl leading-relaxed">
                                Submit a <span className="text-white font-bold">new ticket</span> to our technical team.
                                We typically respond within <span className="text-primary font-bold">12 hours</span>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container max-w-2xl mx-auto px-4 -mt-12 relative z-20">
                <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden p-2">
                    <div className="bg-zinc-100/50 px-8 py-8 rounded-[2rem] border border-zinc-200/50">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 italic">Ticket Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="What's the issue?" {...field} className="rounded-2xl h-14 bg-white border-zinc-200 focus:ring-primary/20 font-bold placeholder:text-zinc-300" />
                                            </FormControl>
                                            <FormMessage className="font-bold text-[10px] uppercase tracking-wider" />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="priority"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 italic">Severity</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="rounded-2xl h-14 bg-white border-zinc-200 font-bold">
                                                            <SelectValue placeholder="Select priority" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white">
                                                        <SelectItem value="LOW" className="rounded-xl font-bold py-3">Low Priority</SelectItem>
                                                        <SelectItem value="MEDIUM" className="rounded-xl font-bold py-3">Medium Priority</SelectItem>
                                                        <SelectItem value="HIGH" className="rounded-xl font-bold py-3 text-orange-600">High Priority</SelectItem>
                                                        <SelectItem value="URGENT" className="rounded-xl font-bold py-3 text-rose-600">Urgent Priority</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="font-bold text-[10px] uppercase tracking-wider" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="department"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 italic">Department</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="IT, HR, Sales..." {...field} className="rounded-2xl h-14 bg-white border-zinc-200 font-bold placeholder:text-zinc-300" />
                                                </FormControl>
                                                <FormMessage className="font-bold text-[10px] uppercase tracking-wider" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 italic">Full Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tell us more about the situation..."
                                                    {...field}
                                                    className="rounded-[2rem] min-h-[180px] bg-white border-zinc-200 resize-none focus:ring-primary/20 font-medium p-6"
                                                />
                                            </FormControl>
                                            <FormDescription className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                                                Include as much detail as possible for faster resolution.
                                            </FormDescription>
                                            <FormMessage className="font-bold text-[10px] uppercase tracking-wider" />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isPending} className="w-full h-16 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 font-black text-lg transition-all hover:scale-[1.02] shadow-xl shadow-zinc-200 active:scale-[0.98]">
                                    {isPending ? "Submitting Request..." : "Submit Ticket Now"}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </Card>
            </div>
        </div>
    );
}
