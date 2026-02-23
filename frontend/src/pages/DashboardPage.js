import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, LogOut, Shield, Ticket, Clock, Plus, Settings, Gift, DollarSign } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL + "/api";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [raffles, setRaffles] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [sponsorStats, setSponsorStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rafflesRes, transactionsRes, sponsorRes] = await Promise.all([
        axios.get(`${API_URL}/raffles/active`),
        axios.get(`${API_URL}/payments/my-transactions`),
        axios.get(`${API_URL}/sponsor/my-code`)
      ]);
      setRaffles(rafflesRes.data);
      setTransactions(transactionsRes.data);
      setSponsorStats(sponsorRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { label: "Administrador", className: "bg-luck-red text-white" },
      editor: { label: "Editor", className: "bg-win-gold text-slate-900" },
      user: { label: "Usuario", className: "bg-trust-blue text-white" }
    };
    return badges[role] || badges.user;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
      completed: { label: "Completado", className: "bg-green-100 text-green-800" },
      failed: { label: "Fallido", className: "bg-red-100 text-red-800" },
      cancelled: { label: "Cancelado", className: "bg-slate-100 text-slate-800" }
    };
    return badges[status] || badges.pending;
  };

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
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-trust-blue rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="font-barlow font-bold text-xl text-trust-blue uppercase tracking-wider hidden sm:block">SuerteApp</span>
          </Link>
          
          <div className="flex items-center gap-3">
            {["admin", "editor"].includes(user?.role) && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="font-barlow uppercase tracking-wider" data-testid="admin-panel-btn">
                  <Settings className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Panel Admin</span>
                </Button>
              </Link>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-slate-600"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-barlow font-bold text-2xl md:text-3xl text-trust-blue uppercase">
                ¡Hola, {user?.full_name?.split(" ")[0]}!
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getRoleBadge(user?.role).className}>
                  <Shield className="w-3 h-3 mr-1" />
                  {getRoleBadge(user?.role).label}
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sponsor Card */}
        {sponsorStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Link to="/sponsor">
              <Card className="border-0 shadow-trust bg-gradient-to-r from-win-gold to-yellow-400 hover:shadow-xl transition-all cursor-pointer" data-testid="sponsor-card">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/30 rounded-full flex items-center justify-center">
                        <Gift className="w-7 h-7 text-slate-900" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-700">Tu código de sponsor</p>
                        <p className="font-barlow font-black text-2xl tracking-widest">{sponsorStats.sponsor_code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="font-barlow font-black text-2xl">${sponsorStats.total_earnings?.toFixed(2) || "0.00"}</p>
                        <p className="text-xs text-slate-700">Ganancias totales</p>
                      </div>
                      <div className="text-center">
                        <p className="font-barlow font-black text-2xl text-green-700">${sponsorStats.pending_earnings?.toFixed(2) || "0.00"}</p>
                        <p className="text-xs text-slate-700">Pendiente</p>
                      </div>
                      <Button className="bg-slate-900 hover:bg-slate-800 rounded-full font-barlow uppercase text-sm">
                        Ver más
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}

        {/* Active Raffles */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-barlow font-bold text-xl text-slate-800 uppercase flex items-center gap-2">
              <Ticket className="w-5 h-5 text-luck-red" />
              Rifas Activas
            </h2>
          </div>
          
          {raffles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {raffles.map((raffle, index) => (
                <motion.div
                  key={raffle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/raffle/${raffle.id}`}>
                    <Card 
                      data-testid={`dashboard-raffle-${index}`}
                      className="overflow-hidden border-0 shadow-trust hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
                    >
                      {raffle.image_url && (
                        <div className="h-40 overflow-hidden">
                          <img 
                            src={raffle.image_url} 
                            alt={raffle.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-5">
                        <h3 className="font-barlow font-bold text-lg text-trust-blue uppercase mb-2">{raffle.title}</h3>
                        <p className="text-slate-600 text-sm line-clamp-2 mb-4">{raffle.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-barlow font-black text-2xl text-luck-red">${raffle.slot_price}</span>
                          <Badge className="bg-green-100 text-green-800">Activa</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-slate-200">
              <CardContent className="py-12 text-center">
                <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No hay rifas activas en este momento</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* My Transactions */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-barlow font-bold text-xl text-slate-800 uppercase flex items-center gap-2">
              <Clock className="w-5 h-5 text-trust-blue" />
              Mis Compras
            </h2>
          </div>
          
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card data-testid={`transaction-${index}`} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-barlow font-bold text-trust-blue uppercase">
                            Números: {transaction.slot_numbers.join(", ")}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          {new Date(transaction.created_at).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-barlow font-black text-xl">${transaction.amount}</span>
                        <Badge className={getStatusBadge(transaction.status).className}>
                          {getStatusBadge(transaction.status).label}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-slate-200">
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">Aún no has comprado números</p>
                {raffles.length > 0 && (
                  <Link to={`/raffle/${raffles[0].id}`}>
                    <Button className="bg-luck-red hover:bg-luck-red/90 rounded-full font-barlow font-bold uppercase">
                      <Plus className="w-4 h-4 mr-2" />
                      Comprar mi primer número
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
