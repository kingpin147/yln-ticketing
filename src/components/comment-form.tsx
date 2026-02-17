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
        <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
                placeholder="Write your response here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] rounded-2xl border-zinc-200 focus-visible:ring-primary/20 resize-none p-4"
                disabled={isPending}
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {isStaff && (
                    <div className="flex items-center space-x-2 bg-zinc-50 px-4 py-2 rounded-full border border-zinc-100">
                        <Lock className={`w-4 h-4 ${isPrivate ? "text-orange-600" : "text-zinc-400"}`} />
                        <Label htmlFor="internal-note" className="text-xs font-bold uppercase tracking-wider cursor-pointer">
                            Internal Note
                        </Label>
                        <Switch
                            id="internal-note"
                            checked={isPrivate}
                            onCheckedChange={setIsPrivate}
                            className="data-[state=checked]:bg-orange-600"
                        />
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isPending || !content.trim()}
                    className="w-full sm:w-auto rounded-full px-8 font-bold gap-2"
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
