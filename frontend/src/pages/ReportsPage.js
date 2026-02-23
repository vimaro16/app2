import { useState, useEffect } from "react";
import { Download, FileText, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { toast } from "sonner";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL + "/api";

export default function ReportsPage() {
  const [reportHistory, setReportHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportHistory();
  }, []);

  const fetchReportHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/reports/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportHistory(response.data);
    } catch (error) {
      console.error("Error fetching report history:", error);
    }
  };

  const downloadExcelReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/reports/excel`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Reporte Excel descargado exitosamente");
      fetchReportHistory();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error al generar reporte Excel");
    } finally {
      setLoading(false);
    }
  };

  const downloadPdfReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/reports/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Reporte PDF descargado exitosamente");
      fetchReportHistory();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error al generar reporte PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-barlow font-bold text-trust-blue uppercase">Reportes</h1>
        <p className="text-slate-600 mt-2">Genera reportes detallados de ventas y ganancias</p>
      </div>

      {/* Generate Reports Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-success-green" />
              Reporte Excel
            </CardTitle>
            <CardDescription>
              Genera un reporte completo en formato Excel con todas las métricas detalladas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-slate-600 space-y-1 mb-4">
              <li>• Resumen general de ventas</li>
              <li>• Ingresos por semana y mes</li>
              <li>• Ganancias por sponsor</li>
              <li>• Compras por usuario</li>
              <li>• Ventas por rifa</li>
            </ul>
            <Button 
              onClick={downloadExcelReport}
              disabled={loading}
              className="w-full bg-success-green hover:bg-success-green/90"
            >
              <Download className="w-4 h-4 mr-2" />
              {loading ? "Generando..." : "Descargar Excel"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-luck-red" />
              Reporte PDF
            </CardTitle>
            <CardDescription>
              Genera un reporte ejecutivo en formato PDF con resumen de métricas clave
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-slate-600 space-y-1 mb-4">
              <li>• Resumen general</li>
              <li>• Ingresos semanales</li>
              <li>• Top 5 sponsors</li>
              <li>• Diseño profesional</li>
            </ul>
            <Button 
              onClick={downloadPdfReport}
              disabled={loading}
              className="w-full bg-luck-red hover:bg-luck-red/90"
            >
              <Download className="w-4 h-4 mr-2" />
              {loading ? "Generando..." : "Descargar PDF"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Historial de Reportes
          </CardTitle>
          <CardDescription>
            Reportes generados recientemente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportHistory.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No hay reportes generados aún</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Generado Por</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Archivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportHistory.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          report.report_type === 'excel' 
                            ? 'bg-success-green/10 text-success-green'
                            : 'bg-luck-red/10 text-luck-red'
                        }`}>
                          {report.report_type.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>{report.generated_by_name}</TableCell>
                      <TableCell>
                        {new Date(report.created_at).toLocaleString('es-ES')}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-slate-600">
                        {report.filename}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
