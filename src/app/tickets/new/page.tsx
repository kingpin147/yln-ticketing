"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
        <div className="container max-w-2xl py-10 px-4 mx-auto">
            <Card className="border-zinc-200 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-8">
                    <CardTitle className="text-2xl font-bold tracking-tight">Create New Ticket</CardTitle>
                    <CardDescription>
                        Fill out the form below to submit a support request to our team.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Brief summary of the issue" {...field} className="rounded-xl h-12 border-zinc-200 focus:ring-primary/20" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Priority</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="rounded-xl h-12 border-zinc-200">
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="LOW">Low</SelectItem>
                                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                                    <SelectItem value="HIGH">High</SelectItem>
                                                    <SelectItem value="URGENT">Urgent</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="department"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Department</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. IT, HR, Legal" {...field} className="rounded-xl h-12 border-zinc-200" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Detailed description of your request"
                                                {...field}
                                                className="rounded-2xl min-h-[150px] border-zinc-200 resize-none focus:ring-primary/20"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Include any relevant information to help us resolve this faster.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/10">
                                Submit Ticket
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
