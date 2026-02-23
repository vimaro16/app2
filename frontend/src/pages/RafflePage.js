import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy, ArrowLeft, ShoppingCart, CreditCard, Building2, Check, Loader2, MessageCircle } from "lucide-react";
import { FaStripe, FaPaypal, FaWhatsapp } from "react-icons/fa";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL + "/api";

export default function RafflePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [raffle, setRaffle] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("whatsapp");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [sponsorCode, setSponsorCode] = useState("");

  const fetchRaffle = useCallback(async () => {
    try {
      const [raffleRes, slotsRes, methodsRes] = await Promise.all([
        axios.get(`${API_URL}/raffles/${id}`),
        axios.get(`${API_URL}/raffles/${id}/slots`),
        axios.get(`${API_URL}/payment-methods`)
      ]);
      setRaffle(raffleRes.data);
      setSlots(slotsRes.data);
      setPaymentMethods(methodsRes.data.filter(m => m.is_active));
    } catch (error) {
      console.error("Error fetching raffle:", error);
      toast.error("Error al cargar la rifa");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRaffle();
    const interval = setInterval(fetchRaffle, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [fetchRaffle]);

  const handleSlotClick = (slot) => {
    if (slot.status !== "available") return;
    
    setSelectedSlots(prev => {
      if (prev.includes(slot.number)) {
        return prev.filter(n => n !== slot.number);
      }
      return [...prev, slot.number];
    });
  };

  const getSlotClass = (slot) => {
    if (selectedSlots.includes(slot.number)) return "slot-selected";
    if (slot.status === "paid") return "slot-paid";
    if (slot.status === "pending") return "slot-pending";
    return "slot-available";
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para comprar");
      navigate("/login");
      return;
    }
    
    if (selectedSlots.length === 0) {
      toast.error("Selecciona al menos un número");
      return;
    }
    
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    setProcessing(true);
    
    try {
      if (paymentMethod === "whatsapp") {
        // Get WhatsApp link directly without reserving
        const response = await axios.get(`${API_URL}/whatsapp/link`, {
          params: {
            raffle_id: id,
            slot_numbers: selectedSlots.sort((a,b) => a-b).join(",")
          }
        });
        
        // Open WhatsApp
        window.open(response.data.whatsapp_url, '_blank');
        
        toast.success("¡WhatsApp abierto! Envía el mensaje para confirmar tu reserva.");
        setShowPaymentModal(false);
        setSelectedSlots([]);
        setSponsorCode("");
        return;
      }
      
      // Reserve slots for other payment methods
      const reserveRes = await axios.post(`${API_URL}/raffles/${id}/slots/reserve`, {
        slot_numbers: selectedSlots,
        payment_method: paymentMethod,
        sponsor_code: sponsorCode || null
      });
      
      const { transaction_id, amount } = reserveRes.data;
      
      if (paymentMethod === "stripe") {
        // Create Stripe session
        const stripeRes = await axios.post(`${API_URL}/payments/stripe/create-session?transaction_id=${transaction_id}`, {
          origin_url: window.location.origin
        });
        
        window.location.href = stripeRes.data.url;
      } else if (paymentMethod === "transfer") {
        toast.success("Reserva realizada. Contacta al administrador para confirmar el pago.");
        setShowPaymentModal(false);
        setSelectedSlots([]);
        setSponsorCode("");
        fetchRaffle();
      } else {
        toast.info("Método de pago en desarrollo");
        setShowPaymentModal(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.detail || "Error al procesar el pago");
    } finally {
      setProcessing(false);
    }
  };

  const totalPrice = selectedSlots.length * (raffle?.slot_price || 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue"></div>
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-slate-500 mb-4">Rifa no encontrada</p>
            <Link to="/">
              <Button className="bg-trust-blue rounded-full font-barlow uppercase">
                Volver al inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={user ? "/dashboard" : "/"}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-trust-blue rounded-full flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="font-barlow font-bold text-lg text-trust-blue uppercase tracking-wider hidden sm:block">SuerteApp</span>
            </Link>
          </div>
          
          {!user && (
            <Link to="/login">
              <Button className="bg-trust-blue rounded-full font-barlow uppercase text-sm" data-testid="raffle-login-btn">
                Ingresar
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Raffle Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Raffle Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-0 shadow-trust overflow-hidden sticky top-20">
                {raffle.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={raffle.image_url} 
                      alt={raffle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h1 className="font-barlow font-bold text-2xl text-trust-blue uppercase">{raffle.title}</h1>
                    <Badge className={raffle.status === "active" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}>
                      {raffle.status === "active" ? "Activa" : "Cerrada"}
                    </Badge>
                  </div>
                  
                  <p className="text-slate-600 mb-6 leading-relaxed">{raffle.description}</p>
                  
                  {raffle.video_url && (
                    <div className="mb-6 rounded-lg overflow-hidden">
                      <iframe
                        src={raffle.video_url.replace("watch?v=", "embed/")}
                        title="Video de la rifa"
                        className="w-full aspect-video"
                        allowFullScreen
                      />
                    </div>
                  )}
                  
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-600">Precio por número:</span>
                      <span className="font-barlow font-black text-2xl text-luck-red">${raffle.slot_price}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Números disponibles:</span>
                      <span className="font-semibold">{slots.filter(s => s.status === "available").length} / 100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Slots Grid */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-trust">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="font-barlow text-lg text-trust-blue uppercase flex items-center gap-2">
                    <span>Selecciona tus números</span>
                    {selectedSlots.length > 0 && (
                      <Badge className="bg-luck-red text-white">{selectedSlots.length} seleccionados</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border-2 border-slate-200 bg-white"></div>
                      <span className="text-slate-600">Disponible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border-2 border-trust-blue bg-blue-100"></div>
                      <span className="text-slate-600">Seleccionado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border-2 border-yellow-400 bg-yellow-50"></div>
                      <span className="text-slate-600">Pendiente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border-2 border-green-500 bg-green-50"></div>
                      <span className="text-slate-600">Pagado</span>
                    </div>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-3">
                    {slots.map((slot) => (
                      <motion.button
                        key={slot.number}
                        data-testid={`slot-${slot.number}`}
                        whileHover={slot.status === "available" ? { scale: 1.05 } : {}}
                        whileTap={slot.status === "available" ? { scale: 0.95 } : {}}
                        onClick={() => handleSlotClick(slot)}
                        disabled={raffle.status !== "active" || slot.status !== "available"}
                        className={`aspect-square flex flex-col items-center justify-center rounded-lg border-2 font-barlow font-bold text-base md:text-lg transition-all select-none relative ${getSlotClass(slot)}`}
                      >
                        <span>{slot.number}</span>
                        {slot.initials && (
                          <span className="text-[10px] md:text-xs font-normal text-slate-500">{slot.initials}</span>
                        )}
                        {selectedSlots.includes(slot.number) && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-trust-blue rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Bar */}
      {raffle.status === "active" && selectedSlots.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50"
        >
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-600">
                {selectedSlots.length} {selectedSlots.length === 1 ? "número" : "números"} seleccionados
              </p>
              <p className="font-barlow font-black text-2xl text-trust-blue">
                Total: ${totalPrice.toFixed(2)}
              </p>
            </div>
            <Button
              onClick={handlePurchase}
              className="bg-luck-red hover:bg-luck-red/90 rounded-full font-barlow font-bold uppercase tracking-wider px-8 py-6 text-lg shadow-luck"
              data-testid="purchase-btn"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Comprar
            </Button>
          </div>
        </motion.div>
      )}

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-barlow text-xl text-trust-blue uppercase">Reservar Números</DialogTitle>
            <DialogDescription>
              Selecciona cómo deseas reservar tus números
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600">Números:</span>
                <span className="font-barlow font-bold">{selectedSlots.sort((a,b) => a-b).join(", ")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total a pagar:</span>
                <span className="font-barlow font-black text-2xl text-luck-red">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
              <Label 
                htmlFor="whatsapp" 
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === "whatsapp" ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-slate-300"}`}
              >
                <RadioGroupItem value="whatsapp" id="whatsapp" />
                <FaWhatsapp className="w-8 h-8 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium">Reservar por WhatsApp</p>
                  <p className="text-sm text-slate-500">Envía mensaje directo al vendedor</p>
                </div>
              </Label>
              
              <Label 
                htmlFor="stripe" 
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === "stripe" ? "border-trust-blue bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
              >
                <RadioGroupItem value="stripe" id="stripe" />
                <FaStripe className="w-12 h-8 text-[#635BFF]" />
                <div className="flex-1">
                  <p className="font-medium">Tarjeta de Crédito/Débito</p>
                  <p className="text-sm text-slate-500">Pago seguro con Stripe</p>
                </div>
              </Label>
              
              <Label 
                htmlFor="transfer" 
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === "transfer" ? "border-trust-blue bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
              >
                <RadioGroupItem value="transfer" id="transfer" />
                <Building2 className="w-8 h-8 text-slate-600" />
                <div className="flex-1">
                  <p className="font-medium">Transferencia Bancaria</p>
                  <p className="text-sm text-slate-500">Pago manual - admin confirma</p>
                </div>
              </Label>
            </RadioGroup>
            
            {/* Sponsor Code Input */}
            {paymentMethod !== "whatsapp" && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Label htmlFor="sponsor_code" className="text-sm font-medium text-yellow-800">
                  ¿Tienes un código de referido? (opcional)
                </Label>
                <input
                  id="sponsor_code"
                  type="text"
                  value={sponsorCode}
                  onChange={(e) => setSponsorCode(e.target.value.toUpperCase())}
                  placeholder="Ej: ABC12345"
                  className="mt-2 w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm uppercase"
                  data-testid="sponsor-code-input"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
              disabled={processing}
              className="rounded-full"
            >
              Cancelar
            </Button>
            <Button
              onClick={processPayment}
              disabled={processing}
              className={`rounded-full font-barlow font-bold uppercase ${paymentMethod === "whatsapp" ? "bg-green-500 hover:bg-green-600" : "bg-luck-red hover:bg-luck-red/90"}`}
              data-testid="confirm-payment-btn"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : paymentMethod === "whatsapp" ? (
                <>
                  <FaWhatsapp className="w-4 h-4 mr-2" />
                  Abrir WhatsApp
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Confirmar Pago
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
