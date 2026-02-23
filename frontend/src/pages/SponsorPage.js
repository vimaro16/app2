import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Trophy, Gift, DollarSign, Users, Share2, Copy, Check, 
  TrendingUp, Clock, ArrowRight, ExternalLink, Banknote, Send,
  AlertCircle, CheckCircle, XCircle, Loader2
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL + "/api";

export default function SponsorPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [earningsByRaffle, setEarningsByRaffle] = useState([]);
  const [earningsByWeek, setEarningsByWeek] = useState([]);
  const [earningsByMonth, setEarningsByMonth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    bank_name: "",
    account_number: "",
    account_holder: user?.full_name || "",
    amount: 0
  });

  useEffect(() => {
    fetchSponsorData();
  }, []);

  useEffect(() => {
    if (user?.full_name) {
      setPaymentForm(prev => ({ ...prev, account_holder: user.full_name }));
    }
  }, [user]);

  const fetchSponsorData = async () => {
    try {
      const [statsRes, earningsRes, weeklyRes, requestsRes] = await Promise.all([
        axios.get(`${API_URL}/sponsor/my-code`),
        axios.get(`${API_URL}/sponsor/my-earnings`),
        axios.get(`${API_URL}/sponsor/my-weekly-summary`),
        axios.get(`${API_URL}/sponsor/my-payment-requests`)
      ]);
      setStats(statsRes.data);
      setEarnings(earningsRes.data);
      setWeeklySummary(weeklyRes.data);
      setPaymentRequests(requestsRes.data);
      
      // Pre-fill amount with total pending
      if (weeklyRes.data.total_pending > 0) {
        setPaymentForm(prev => ({ ...prev, amount: weeklyRes.data.total_pending }));
      }
    } catch (error) {
      console.error("Error fetching sponsor data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("¡Copiado al portapapeles!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const message = `¡Únete a SuerteApp y participa en rifas increíbles! 🎰\n\nUsa mi código de referido: *${stats?.sponsor_code}*\n\nRegístrate aquí: ${window.location.origin}/register?ref=${stats?.sponsor_code}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePaymentRequest = async (e) => {
    e.preventDefault();
    
    if (!paymentForm.bank_name || !paymentForm.account_number || !paymentForm.account_holder) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    
    if (paymentForm.amount <= 0 || paymentForm.amount > weeklySummary?.total_pending) {
      toast.error("Monto inválido");
      return;
    }
    
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/sponsor/request-payment`, paymentForm);
      toast.success("¡Solicitud de pago enviada! El administrador la revisará pronto.");
      setShowPaymentModal(false);
      fetchSponsorData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error al enviar solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { label: "Aprobado", className: "bg-blue-100 text-blue-800", icon: CheckCircle },
      paid: { label: "Pagado", className: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { label: "Rechazado", className: "bg-red-100 text-red-800", icon: XCircle }
    };
    return badges[status] || badges.pending;
  };

  const referralLink = `${window.location.origin}/register?ref=${stats?.sponsor_code}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-trust-blue rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="font-barlow font-bold text-xl text-trust-blue uppercase tracking-wider hidden sm:block">SuerteApp</span>
          </Link>
          
          <Link to="/dashboard">
            <Button variant="outline" className="rounded-full font-barlow uppercase text-sm">
              ← Volver
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-win-gold to-yellow-500 text-slate-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-8 h-8" />
            <h1 className="font-barlow font-black text-2xl md:text-3xl uppercase tracking-tight">
              Programa de Sponsors
            </h1>
          </div>
          <p className="text-slate-700 max-w-2xl">
            Gana el <strong>{stats?.commission_rate || 10}%</strong> de comisión por cada número vendido con tu código de referido.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Sponsor Code Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-trust overflow-hidden">
            <div className="bg-trust-blue p-6 text-white">
              <p className="text-blue-200 text-sm mb-2">Tu código de sponsor</p>
              <div className="flex items-center gap-4">
                <span className="font-barlow font-black text-4xl tracking-widest">{stats?.sponsor_code}</span>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => copyToClipboard(stats?.sponsor_code)}
                  className="bg-white/20 hover:bg-white/30 text-white"
                  data-testid="copy-code-btn"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </Button>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-slate-600 mb-4">Comparte tu enlace de referido:</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-slate-50 rounded-lg p-3 text-sm text-slate-600 truncate">
                  {referralLink}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(referralLink)}
                    className="rounded-full"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </Button>
                  <Button
                    onClick={shareOnWhatsApp}
                    className="bg-green-500 hover:bg-green-600 rounded-full"
                    data-testid="share-whatsapp-btn"
                  >
                    <FaWhatsapp className="w-4 h-4 mr-2" />
                    Compartir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Summary & Request Payment */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-trust h-full">
              <CardHeader>
                <CardTitle className="font-barlow text-lg text-trust-blue uppercase flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Resumen Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-slate-500 mb-1">Semana: {weeklySummary?.week}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-barlow font-black text-trust-blue">${weeklySummary?.week_earnings?.toFixed(2) || "0.00"}</p>
                      <p className="text-xs text-slate-500">Ganado esta semana</p>
                    </div>
                    <div>
                      <p className="text-2xl font-barlow font-black">{weeklySummary?.week_sales || 0}</p>
                      <p className="text-xs text-slate-500">Ventas esta semana</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-800 font-medium">Total pendiente de cobro:</span>
                    <span className="font-barlow font-black text-2xl text-green-700">
                      ${weeklySummary?.total_pending?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mb-4">{weeklySummary?.pending_sales || 0} ventas pendientes de pago</p>
                  
                  {weeklySummary?.has_pending_request ? (
                    <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 p-3 rounded-lg">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm font-medium">Tienes una solicitud de pago pendiente</span>
                    </div>
                  ) : weeklySummary?.can_request_payment ? (
                    <Button
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full bg-green-600 hover:bg-green-700 rounded-full font-barlow font-bold uppercase"
                      data-testid="request-payment-btn"
                    >
                      <Banknote className="w-5 h-5 mr-2" />
                      Solicitar Transferencia
                    </Button>
                  ) : (
                    <p className="text-sm text-slate-500 text-center">No tienes ganancias pendientes para solicitar</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="grid grid-cols-2 gap-4 h-full">
              <Card className="border-0 shadow-trust">
                <CardContent className="p-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-barlow font-black text-green-600">${stats?.total_earnings?.toFixed(2) || "0.00"}</p>
                  <p className="text-sm text-slate-500">Ganancias Totales</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-trust">
                <CardContent className="p-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-barlow font-black text-yellow-600">${stats?.pending_earnings?.toFixed(2) || "0.00"}</p>
                  <p className="text-sm text-slate-500">Pendiente</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-trust">
                <CardContent className="p-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-barlow font-black">{stats?.total_sales || 0}</p>
                  <p className="text-sm text-slate-500">Ventas Totales</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-trust">
                <CardContent className="p-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-barlow font-black">{stats?.referred_users || 0}</p>
                  <p className="text-sm text-slate-500">Referidos</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Payment Requests History */}
        {paymentRequests.length > 0 && (
          <Card className="border-0 shadow-trust mb-8">
            <CardHeader>
              <CardTitle className="font-barlow text-lg text-trust-blue uppercase flex items-center gap-2">
                <Banknote className="w-5 h-5" />
                Mis Solicitudes de Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentRequests.map((req, index) => {
                  const statusInfo = getStatusBadge(req.status);
                  return (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{req.bank_name} - ***{req.account_number.slice(-4)}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(req.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <p className="font-barlow font-black text-lg">${req.amount.toFixed(2)}</p>
                        <Badge className={statusInfo.className}>
                          <statusInfo.icon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* How it works */}
        <Card className="border-0 shadow-trust mb-8">
          <CardHeader>
            <CardTitle className="font-barlow text-lg text-trust-blue uppercase">¿Cómo funciona?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-trust-blue text-white rounded-full flex items-center justify-center flex-shrink-0 font-barlow font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium mb-1">Comparte tu código</p>
                  <p className="text-sm text-slate-500">Envía tu código o enlace a amigos</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-trust-blue text-white rounded-full flex items-center justify-center flex-shrink-0 font-barlow font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium mb-1">Ellos compran números</p>
                  <p className="text-sm text-slate-500">Ganas 10% de cada venta</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-trust-blue text-white rounded-full flex items-center justify-center flex-shrink-0 font-barlow font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium mb-1">Solicita tu pago</p>
                  <p className="text-sm text-slate-500">Ingresa tus datos bancarios</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-barlow font-bold">
                  4
                </div>
                <div>
                  <p className="font-medium mb-1">Recibe tu dinero</p>
                  <p className="text-sm text-slate-500">Transferencia a tu cuenta</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings History */}
        <Card className="border-0 shadow-trust">
          <CardHeader>
            <CardTitle className="font-barlow text-lg text-trust-blue uppercase flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Historial de Comisiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {earnings.length > 0 ? (
              <div className="space-y-3">
                {earnings.map((earning, index) => (
                  <motion.div
                    key={earning.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{earning.buyer_name}</p>
                      <p className="text-sm text-slate-500">
                        Números: {earning.slot_numbers.join(", ")} • {new Date(earning.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-barlow font-black text-lg text-green-600">+${earning.commission_amount.toFixed(2)}</p>
                      <Badge className={earning.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {earning.status === "paid" ? "Pagado" : "Pendiente"}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Gift className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">Aún no tienes comisiones</p>
                <Button onClick={shareOnWhatsApp} className="bg-green-500 hover:bg-green-600 rounded-full">
                  <FaWhatsapp className="w-4 h-4 mr-2" />
                  Compartir mi código
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Payment Request Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-barlow text-xl text-trust-blue uppercase flex items-center gap-2">
              <Banknote className="w-6 h-6" />
              Solicitar Transferencia
            </DialogTitle>
            <DialogDescription>
              Ingresa los datos de tu cuenta bancaria para recibir el pago
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handlePaymentRequest} className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm text-green-700">Saldo disponible para retiro:</p>
              <p className="font-barlow font-black text-3xl text-green-700">
                ${weeklySummary?.total_pending?.toFixed(2) || "0.00"}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bank_name">Nombre del Banco</Label>
              <Input
                id="bank_name"
                value={paymentForm.bank_name}
                onChange={(e) => setPaymentForm({ ...paymentForm, bank_name: e.target.value })}
                placeholder="Ej: Bancolombia, Nequi, Daviplata"
                required
                data-testid="bank-name-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="account_number">Número de Cuenta</Label>
              <Input
                id="account_number"
                value={paymentForm.account_number}
                onChange={(e) => setPaymentForm({ ...paymentForm, account_number: e.target.value })}
                placeholder="Número de cuenta o celular"
                required
                data-testid="account-number-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="account_holder">Titular de la Cuenta</Label>
              <Input
                id="account_holder"
                value={paymentForm.account_holder}
                onChange={(e) => setPaymentForm({ ...paymentForm, account_holder: e.target.value })}
                placeholder="Nombre completo del titular"
                required
                data-testid="account-holder-input"
              />
              <p className="text-xs text-slate-500">Debe coincidir con tu nombre registrado</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Monto a Solicitar</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={weeklySummary?.total_pending || 0}
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                required
                data-testid="amount-input"
              />
            </div>
            
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
                disabled={submitting}
                className="rounded-full"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting || !paymentForm.bank_name || !paymentForm.account_number || !paymentForm.account_holder || paymentForm.amount <= 0}
                className="bg-green-600 hover:bg-green-700 rounded-full font-barlow font-bold uppercase"
                data-testid="submit-payment-request-btn"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Solicitar Pago
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
