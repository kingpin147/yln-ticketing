"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { inviteUser } from "@/app/actions/admin";
import { Role } from "@/lib/constants";
import { toast } from "sonner";
import { UserPlus, Mail, Shield, Loader2, Send } from "lucide-react";

const formSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.nativeEnum(Role),
});

export function InviteUserModal({
    canManageAdmins,
    isCompact = false
}: {
    canManageAdmins: boolean;
    isCompact?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            role: Role.AGENT,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsPending(true);
        try {
            await inviteUser(values);
            toast.success("Invitation sent successfully!");
            setOpen(false);
            form.reset();
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isCompact ? (
                    <Button
                        variant="ghost"
                        className="rounded-2xl h-10 border-zinc-200 bg-white hover:bg-zinc-50 text-primary font-black text-[9px] uppercase tracking-widest gap-2 transition-all shadow-sm border"
                    >
                        <UserPlus className="w-3 h-3" />
                        Invite
                    </Button>
                ) : (
                    <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 font-black text-xs uppercase tracking-widest gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <UserPlus className="w-4 h-4" />
                        Invite Agent
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
                <div className="bg-primary px-8 py-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black tracking-tighter flex items-center gap-3">
                            <Mail className="w-8 h-8" />
                            Invite Member
                        </DialogTitle>
                        <DialogDescription className="text-primary-foreground/80 font-medium text-base mt-2">
                            Send an email invitation to join the team.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Email Address</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                                                <Input placeholder="agent@ylnteam.com" {...field} className="rounded-2xl h-14 pl-12 border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all font-bold placeholder:text-zinc-200" />
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
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Assigned Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary z-10 transition-colors" />
                                                    <SelectTrigger className="rounded-2xl h-14 pl-12 border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all font-bold">
                                                        <SelectValue placeholder="Select a role" />
                                                    </SelectTrigger>
                                                </div>
                                            </FormControl>
                                            <SelectContent className="rounded-2xl border-zinc-100 shadow-xl">
                                                <SelectItem value={Role.AGENT} className="rounded-xl font-bold py-3 focus:bg-primary/5 focus:text-primary transition-colors">Frontline Agent</SelectItem>
                                                <SelectItem value={Role.SUBMITTER} className="rounded-xl font-bold py-3 focus:bg-primary/5 focus:text-primary transition-colors">Basic Submitter</SelectItem>
                                                {canManageAdmins && (
                                                    <SelectItem value={Role.SUB_ADMIN} className="rounded-xl font-bold py-3 focus:bg-rose-50 focus:text-rose-600 transition-colors">Sub Administrator</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="font-bold text-[10px] uppercase tracking-wider" />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full rounded-2xl h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-3"
                            >
                                {isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send Invitation
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
