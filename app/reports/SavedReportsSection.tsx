"use client";

import { deleteSharedReport, getOrCreateShareLink, getUserSharedReports, SharedReport } from "@/app/actions/reports-shared";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SavedReportsSectionProps {
  userId: number;
}

export function SavedReportsSection({ userId }: SavedReportsSectionProps) {
  const [reports, setReports] = useState<SharedReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function fetchReports() {
    setLoading(true);
    try {
      const data = await getUserSharedReports(userId);
      setReports(data);
    } catch (e) {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, [userId]);

  async function handleCopyLink(reportId: number) {
    try {
      const { share_token } = await getOrCreateShareLink(userId, reportId);
      const url = `${window.location.origin}/shared-report/${share_token}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch (e) {
      toast.error("Failed to copy link");
    }
  }

  async function handleDelete(reportId: number) {
    setDeletingId(reportId);
    try {
      await deleteSharedReport(userId, reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      toast.success("Report deleted");
    } catch (e) {
      toast.error("Failed to delete report");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Meus Relatórios Gerados</h2>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Data Inicial</TableHead>
              <TableHead>Data Final</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Link Compartilhamento</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Carregando...</TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Nenhum relatório encontrado.</TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.report_type}</TableCell>
                  <TableCell>{new Date(report.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(report.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(report.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(report.id)}
                    >
                      <Copy className="w-4 h-4 mr-1" /> Copiar Link
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(report.id)}
                      disabled={deletingId === report.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
} 