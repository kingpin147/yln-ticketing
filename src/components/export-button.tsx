"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useState } from "react";

export function ExportButton({ data, filename = "tickets_report.xlsx" }: { data: any[], filename?: string }) {
    const [loading, setLoading] = useState(false);

    const handleExport = () => {
        setLoading(true);
        try {
            if (!data || data.length === 0) {
                toast.error("No data to export");
                return;
            }

            // Flatten data for Excel if needed
            const exportData = data.map(item => ({
                "Ticket ID": item.ticketId,
                "Title": item.title,
                "Status": item.status,
                "Priority": item.priority,
                "Submitted By": item.submittedBy?.name || "Unknown",
                "Submitted On": new Date(item.createdAt).toLocaleDateString(),
                "Assigned To": item.assignedTo?.name || "Unassigned",
                "Department": item.department || "General",
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");

            XLSX.writeFile(workbook, filename);
            toast.success("Report downloaded successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate report");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-2 border-zinc-200 hover:bg-zinc-50 font-bold px-4"
            onClick={handleExport}
            disabled={loading}
        >
            <Download className="w-4 h-4" />
            Export Excel
        </Button>
    );
}
