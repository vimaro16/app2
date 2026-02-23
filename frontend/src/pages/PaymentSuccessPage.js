import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy, CheckCircle, Loader2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL + "/api";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("loading");
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    if (sessionId) {
      pollPaymentStatus(0);
    }
  }, [sessionId]);

  const pollPaymentStatus = async (attempts) => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setStatus("timeout");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/payments/stripe/status/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPaymentData(response.data);
      
      if (response.data.payment_status === "paid") {
        setStatus("success");
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else if (response.data.status === "expired") {
        setStatus("expired");
      } else {
        setTimeout(() => pollPaymentStatus(attempts + 1), pollInterval);
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setStatus("error");
    }
  };

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-trust-blue mx-auto mb-6 animate-spin" />
            <h1 className="font-barlow font-bold text-2xl text-trust-blue uppercase mb-3">
              Verificando Pago
            </h1>
            <p className="text-slate-600">
              Por favor espera mientras confirmamos tu pago...
            </p>
          </div>
        );
      
      case "success":
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="font-barlow font-bold text-2xl text-green-600 uppercase mb-3">
              ¡Pago Exitoso!
            </h1>
            <p className="text-slate-600 mb-6">
              Tu compra ha sido procesada correctamente. Tus números ya están reservados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button className="bg-trust-blue hover:bg-trust-blue/90 rounded-full font-barlow uppercase">
                  Ver Mis Números
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="rounded-full font-barlow uppercase">
                  Volver al Inicio
                </Button>
              </Link>
            </div>
          </motion.div>
        );
      
      case "expired":
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-yellow-600" />
            </div>
            <h1 className="font-barlow font-bold text-2xl text-yellow-600 uppercase mb-3">
              Sesión Expirada
            </h1>
            <p className="text-slate-600 mb-6">
              Tu sesión de pago ha expirado. Por favor intenta nuevamente.
            </p>
            <Link to="/dashboard">
              <Button className="bg-trust-blue rounded-full font-barlow uppercase">
                <ArrowRight className="w-4 h-4 mr-2" />
                Volver a Intentar
              </Button>
            </Link>
          </div>
        );
      
      case "timeout":
      case "error":
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="font-barlow font-bold text-2xl text-red-600 uppercase mb-3">
              Error de Verificación
            </h1>
            <p className="text-slate-600 mb-6">
              No pudimos verificar tu pago. Si el dinero fue debitado, contacta al administrador.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button className="bg-trust-blue rounded-full font-barlow uppercase">
                  Ir al Dashboard
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="rounded-full font-barlow uppercase">
                  Volver al Inicio
                </Button>
              </Link>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-blue to-blue-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Trophy className="w-6 h-6 text-trust-blue" />
          </div>
          <span className="font-barlow font-bold text-2xl text-white uppercase tracking-wider">SuerteApp</span>
        </Link>

        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8">
            {renderContent()}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
