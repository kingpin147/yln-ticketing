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
import { UserPlus, Mail, Shield, User } from "lucide-react";
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
                <Button className="rounded-full gap-2 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white font-black h-14 px-8 transition-all hover:scale-105 active:scale-95 text-xs uppercase tracking-widest">
                    <UserPlus className="w-4 h-4" />
                    Add Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] rounded-[3rem] border-none shadow-2xl bg-white p-0 overflow-hidden">
                <div className="bg-zinc-900 px-10 py-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-4xl font-black tracking-tighter italic">Create Profile</DialogTitle>
                        <DialogDescription className="text-zinc-400 font-medium text-lg mt-2 leading-relaxed">
                            Provision a new <span className="text-white font-bold">platform account</span> for staff or users.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-10 pb-12 pt-10 bg-white">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1 italic">Full Name</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                                                <Input placeholder="John Doe" {...field} className="rounded-2xl h-14 pl-12 border-zinc-100 bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all font-bold placeholder:text-zinc-200" />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="font-bold text-[10px] uppercase tracking-wider" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1 italic">Email Address</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                                                <Input placeholder="john@example.com" {...field} className="rounded-2xl h-14 pl-12 border-zinc-100 bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all font-bold placeholder:text-zinc-200" />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="font-bold text-[10px] uppercase tracking-wider" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1 italic">Permissions Level</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary z-10 transition-colors" />
                                                    <SelectTrigger className="rounded-2xl h-14 pl-12 border-zinc-100 bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all font-bold">
                                                        <SelectValue placeholder="Select a role" />
                                                    </SelectTrigger>
                                                </div>
                                            </FormControl>
                                            <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white">
                                                <SelectItem value={Role.SUBMITTER} className="rounded-xl py-3 font-bold">Regular Submitter</SelectItem>
                                                <SelectItem value={Role.AGENT} className="rounded-xl py-3 font-bold">Support Agent</SelectItem>
                                                {canManageAdmins && <SelectItem value={Role.SUB_ADMIN} className="rounded-xl py-3 font-bold text-primary">Sub Admin (Control)</SelectItem>}
                                                {canManageAdmins && <SelectItem value={Role.SUPER_ADMIN} className="rounded-xl py-3 font-bold text-rose-600">Super Admin (Full)</SelectItem>}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="font-bold text-[10px] uppercase tracking-wider" />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-zinc-200 bg-zinc-900 hover:bg-zinc-800 text-white transition-all hover:scale-[1.02] active:scale-[0.98] mt-4" disabled={loading}>
                                {loading ? "Creating..." : "Provision Account"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
