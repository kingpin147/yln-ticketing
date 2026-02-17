"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Role } from "@/lib/constants";
import { createUser } from "@/app/actions/admin";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserPlus, Plus } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    role: z.nativeEnum(Role),
});

export function AddUserModal({ canManageAdmins }: { canManageAdmins: boolean }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            role: Role.SUBMITTER,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            await createUser(values);
            toast.success("User added successfully!");
            setOpen(false);
            form.reset();
        } catch (error: any) {
            toast.error(error.message || "Failed to add user");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-full gap-2 shadow-lg shadow-primary/10">
                    <UserPlus className="w-4 h-4" />
                    Add Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight">Add New Member</DialogTitle>
                    <DialogDescription>
                        Create a new profile for an agent, administrator, or regular user.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} className="rounded-xl h-11 border-zinc-200" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="john@example.com" {...field} className="rounded-xl h-11 border-zinc-200" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Initial Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="rounded-xl h-11 border-zinc-200">
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value={Role.SUBMITTER}>Regular User</SelectItem>
                                            <SelectItem value={Role.AGENT}>Support Agent</SelectItem>
                                            {canManageAdmins && <SelectItem value={Role.SUB_ADMIN}>Sub Admin</SelectItem>}
                                            {canManageAdmins && <SelectItem value={Role.SUPER_ADMIN}>Super Admin</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/10" disabled={loading}>
                            {loading ? "Creating..." : "Create User Profile"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
