"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addComment } from "@/app/actions/tickets";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Lock, Send } from "lucide-react";

export function CommentForm({ ticketId, isStaff }: { ticketId: string; isStaff: boolean }) {
    const [content, setContent] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsPending(true);
        try {
            await addComment(ticketId, content, isPrivate);
            setContent("");
            toast.success(isPrivate ? "Internal note added" : "Comment posted");
        } catch (error: any) {
            toast.error(error.message || "Failed to post comment");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Textarea
                placeholder="Write your response here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[160px] rounded-[2.5rem] border-zinc-200 focus-visible:ring-primary/10 resize-none p-8 font-medium bg-zinc-50/50 focus:bg-white transition-all text-zinc-800 placeholder:text-zinc-300 shadow-inner"
                disabled={isPending}
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
                {isStaff && (
                    <div className={`flex items-center space-x-4 px-6 py-3 rounded-full border transition-all ${isPrivate ? "bg-orange-50 border-orange-100 text-orange-700 shadow-sm" : "bg-zinc-50 border-zinc-100 text-zinc-400"}`}>
                        <Lock className={`w-4 h-4 ${isPrivate ? "text-orange-600" : "text-zinc-400"}`} />
                        <Label htmlFor="internal-note" className="text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer">
                            Internal Visibility Only
                        </Label>
                        <Switch
                            id="internal-note"
                            checked={isPrivate}
                            onCheckedChange={setIsPrivate}
                            className="data-[state=checked]:bg-orange-600 scale-90"
                        />
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isPending || !content.trim()}
                    className="w-full sm:w-auto rounded-full h-14 px-10 font-black text-xs uppercase tracking-[0.15em] gap-3 shadow-xl shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary hover:bg-primary/90 text-white"
                >
                    {isPending ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                    Post Response
                </Button>
            </div>
        </form>
    );
}
