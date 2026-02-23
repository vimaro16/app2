import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Trophy, Users, Ticket, CreditCard, BarChart3, Settings, 
  Plus, Edit, Trash2, Check, X, LogOut, Menu, ChevronDown,
  Image, Video, DollarSign, Eye, EyeOff, AlertCircle, MessageCircle, Gift, Banknote,
  FileText, Palette, Download
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL + "/api";

// Sidebar Component
const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const menuItems = [
    { path: "/admin", icon: BarChart3, label: "Dashboard", exact: true },
    { path: "/admin/users", icon: Users, label: "Usuarios" },
    { path: "/admin/raffles", icon: Ticket, label: "Rifas" },
    { path: "/admin/payments", icon: CreditCard, label: "Pagos" },
    { path: "/admin/sponsors", icon: Gift, label: "Sponsors" },
    { path: "/admin/withdrawals", icon: Banknote, label: "Retiros" },
    { path: "/admin/reports", icon: FileText, label: "Reportes" },
    { path: "/admin/content", icon: Palette, label: "Editar Contenido" },
    { path: "/admin/payment-methods", icon: Settings, label: "Métodos de Pago" },
    { path: "/admin/whatsapp", icon: MessageCircle, label: "WhatsApp" },
  ];
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-trust-blue text-white w-64 z-50 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 border-b border-blue-400/30">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-trust-blue" />
            </div>
            <span className="font-barlow font-bold text-xl uppercase tracking-wider">Admin</span>
          </Link>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-white/20 text-white" 
                    : "text-blue-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-400/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="font-barlow font-bold">{user?.full_name?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.full_name}</p>
              <p className="text-xs text-blue-200 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full border-white/30 text-white hover:bg-white/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>
    </>
  );
};

// Dashboard Overview
const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="animate-pulse">Cargando...</div>;
  }
  
  const statCards = [
    { label: "Usuarios", value: stats?.total_users || 0, icon: Users, color: "bg-blue-500" },
    { label: "Rifas Totales", value: stats?.total_raffles || 0, icon: Ticket, color: "bg-purple-500" },
    { label: "Rifas Activas", value: stats?.active_raffles || 0, icon: Eye, color: "bg-green-500" },
    { label: "Ingresos Totales", value: `$${stats?.total_revenue?.toFixed(2) || "0.00"}`, icon: DollarSign, color: "bg-win-gold" },
  ];
  
  return (
    <div>
      <h1 className="font-barlow font-bold text-2xl text-trust-blue uppercase mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-trust">
              <CardContent className="p-4">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-barlow font-black">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Users Management
const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const updateRole = async (userId, newRole) => {
    try {
      await axios.put(`${API_URL}/users/${userId}/role`, { role: newRole });
      toast.success("Rol actualizado");
      fetchUsers();
    } catch (error) {
      toast.error("Error al actualizar rol");
    }
  };
  
  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_URL}/users/${userId}`);
      toast.success("Usuario eliminado");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error al eliminar usuario");
    }
  };
  
  const getRoleBadge = (role) => {
    const badges = {
      admin: "bg-luck-red text-white",
      editor: "bg-win-gold text-slate-900",
      user: "bg-trust-blue text-white"
    };
    return badges[role] || badges.user;
  };
  
  return (
    <div>
      <h1 className="font-barlow font-bold text-2xl text-trust-blue uppercase mb-6">Gestión de Usuarios</h1>
      
      <Card className="border-0 shadow-trust">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{user.cedula}</TableCell>
                  <TableCell>{user.whatsapp}</TableCell>
                  <TableCell>
                    <Select value={user.role} onValueChange={(value) => updateRole(user.id, value)}>
                      <SelectTrigger className="w-32">
                        <Badge className={getRoleBadge(user.role)}>{user.role}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="user">Usuario</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente a {user.full_name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteUser(user.id)} className="bg-red-500 hover:bg-red-600">
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Raffles Management
const RafflesManagement = () => {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRaffle, setEditingRaffle] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    video_url: "",
    slot_price: ""
  });
  
  useEffect(() => {
    fetchRaffles();
  }, []);
  
  const fetchRaffles = async () => {
    try {
      const response = await axios.get(`${API_URL}/raffles`);
      setRaffles(response.data);
    } catch (error) {
      console.error("Error fetching raffles:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRaffle) {
        await axios.put(`${API_URL}/raffles/${editingRaffle.id}`, {
          ...formData,
          slot_price: parseFloat(formData.slot_price)
        });
        toast.success("Rifa actualizada");
      } else {
        await axios.post(`${API_URL}/raffles`, {
          ...formData,
          slot_price: parseFloat(formData.slot_price)
        });
        toast.success("Rifa creada");
      }
      setShowModal(false);
      resetForm();
      fetchRaffles();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error al guardar rifa");
    }
  };
  
  const openEditModal = (raffle) => {
    setEditingRaffle(raffle);
    setFormData({
      title: raffle.title,
      description: raffle.description,
      image_url: raffle.image_url || "",
      video_url: raffle.video_url || "",
      slot_price: raffle.slot_price.toString()
    });
    setShowModal(true);
  };
  
  const resetForm = () => {
    setEditingRaffle(null);
    setFormData({ title: "", description: "", image_url: "", video_url: "", slot_price: "" });
  };
  
  const toggleStatus = async (raffle) => {
    const newStatus = raffle.status === "active" ? "inactive" : "active";
    try {
      await axios.put(`${API_URL}/raffles/${raffle.id}`, { status: newStatus });
      toast.success(`Rifa ${newStatus === "active" ? "activada" : "desactivada"}`);
      fetchRaffles();
    } catch (error) {
      toast.error("Error al cambiar estado");
    }
  };
  
  const deleteRaffle = async (raffleId) => {
    try {
      await axios.delete(`${API_URL}/raffles/${raffleId}`);
      toast.success("Rifa eliminada");
      fetchRaffles();
    } catch (error) {
      toast.error("Error al eliminar rifa");
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-barlow font-bold text-2xl text-trust-blue uppercase">Gestión de Rifas</h1>
        <Button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-luck-red hover:bg-luck-red/90 rounded-full font-barlow font-bold uppercase"
          data-testid="create-raffle-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Rifa
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {raffles.map((raffle) => (
          <Card key={raffle.id} className="border-0 shadow-trust overflow-hidden">
            {raffle.image_url && (
              <div className="h-40 overflow-hidden">
                <img src={raffle.image_url} alt={raffle.title} className="w-full h-full object-cover" />
              </div>
            )}
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-barlow font-bold text-lg text-trust-blue uppercase">{raffle.title}</h3>
                <Badge className={raffle.status === "active" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}>
                  {raffle.status === "active" ? "Activa" : "Inactiva"}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2 mb-4">{raffle.description}</p>
              <p className="font-barlow font-black text-xl text-luck-red mb-4">${raffle.slot_price} por número</p>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditModal(raffle)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toggleStatus(raffle)}
                  className={raffle.status === "active" ? "text-red-500" : "text-green-500"}
                >
                  {raffle.status === "active" ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {raffle.status === "active" ? "Desactivar" : "Activar"}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar rifa?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción eliminará la rifa y todos sus números. No se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteRaffle(raffle.id)} className="bg-red-500">
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-barlow text-xl text-trust-blue uppercase">
              {editingRaffle ? "Editar Rifa" : "Nueva Rifa"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                data-testid="raffle-title-input"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
                data-testid="raffle-description-input"
              />
            </div>
            
            <div>
              <Label htmlFor="slot_price">Precio por número ($)</Label>
              <Input
                id="slot_price"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.slot_price}
                onChange={(e) => setFormData({ ...formData, slot_price: e.target.value })}
                required
                data-testid="raffle-price-input"
              />
            </div>
            
            <div>
              <Label htmlFor="image_url">URL de Imagen (opcional)</Label>
              <div className="flex gap-2">
                <Image className="w-5 h-5 text-slate-400 mt-2" />
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="video_url">URL de Video YouTube (opcional)</Label>
              <div className="flex gap-2">
                <Video className="w-5 h-5 text-slate-400 mt-2" />
                <Input
                  id="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-trust-blue" data-testid="save-raffle-btn">
                {editingRaffle ? "Guardar Cambios" : "Crear Rifa"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Payments Management
const PaymentsManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/payments/pending`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const confirmPayment = async (transactionId) => {
    try {
      await axios.post(`${API_URL}/payments/transfer/confirm?transaction_id=${transactionId}`);
      toast.success("Pago confirmado");
      fetchTransactions();
    } catch (error) {
      toast.error("Error al confirmar pago");
    }
  };
  
  return (
    <div>
      <h1 className="font-barlow font-bold text-2xl text-trust-blue uppercase mb-6">Pagos Pendientes</h1>
      
      {transactions.length > 0 ? (
        <Card className="border-0 shadow-trust">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Números</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.user_id}</TableCell>
                    <TableCell>{tx.slot_numbers.join(", ")}</TableCell>
                    <TableCell className="font-barlow font-bold">${tx.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tx.payment_method}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(tx.created_at).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell className="text-right">
                      {tx.payment_method === "transfer" && (
                        <Button 
                          size="sm" 
                          onClick={() => confirmPayment(tx.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Confirmar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="py-12 text-center">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No hay pagos pendientes</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Payment Methods Management
const PaymentMethodsManagement = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    method_type: "transfer",
    name: "",
    is_active: true,
    details: {}
  });
  
  useEffect(() => {
    fetchMethods();
  }, []);
  
  const fetchMethods = async () => {
    try {
      const response = await axios.get(`${API_URL}/payment-methods`);
      setMethods(response.data);
    } catch (error) {
      console.error("Error fetching methods:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/payment-methods`, formData);
      toast.success("Método de pago creado");
      setShowModal(false);
      setFormData({ method_type: "transfer", name: "", is_active: true, details: {} });
      fetchMethods();
    } catch (error) {
      toast.error("Error al crear método de pago");
    }
  };
  
  const deleteMethod = async (methodId) => {
    try {
      await axios.delete(`${API_URL}/payment-methods/${methodId}`);
      toast.success("Método de pago eliminado");
      fetchMethods();
    } catch (error) {
      toast.error("Error al eliminar método de pago");
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-barlow font-bold text-2xl text-trust-blue uppercase">Métodos de Pago</h1>
        <Button 
          onClick={() => setShowModal(true)}
          className="bg-trust-blue rounded-full font-barlow font-bold uppercase"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Método
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {methods.map((method) => (
          <Card key={method.id} className="border-0 shadow-trust">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-barlow font-bold text-lg">{method.name}</h3>
                <Badge className={method.is_active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}>
                  {method.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 mb-4 capitalize">{method.method_type}</p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-red-500">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar método de pago?</AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMethod(method.id)} className="bg-red-500">
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-barlow text-xl text-trust-blue uppercase">
              Nuevo Método de Pago
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Tipo</Label>
              <Select 
                value={formData.method_type} 
                onValueChange={(value) => setFormData({ ...formData, method_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Nombre</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Banco Nacional"
                required
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Activo</Label>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-trust-blue">
                Crear Método
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Sponsors Management
const SponsorsManagement = () => {
  const [sponsors, setSponsors] = useState([]);
  const [weeklyMessages, setWeeklyMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  
  useEffect(() => {
    fetchSponsors();
  }, []);
  
  const fetchSponsors = async () => {
    try {
      const response = await axios.get(`${API_URL}/sponsor/all-sponsors`);
      setSponsors(response.data);
    } catch (error) {
      console.error("Error fetching sponsors:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const generateWeeklyMessages = async () => {
    try {
      const response = await axios.post(`${API_URL}/sponsor/send-weekly-whatsapp`);
      setWeeklyMessages(response.data.messages);
      setShowMessagesModal(true);
    } catch (error) {
      toast.error("Error al generar mensajes");
    }
  };
  
  const payAllPending = async (userId) => {
    try {
      await axios.post(`${API_URL}/sponsor/pay-all/${userId}`);
      toast.success("Ganancias marcadas como pagadas");
      fetchSponsors();
    } catch (error) {
      toast.error("Error al marcar como pagado");
    }
  };
  
  if (loading) {
    return <div className="animate-pulse">Cargando...</div>;
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-barlow font-bold text-2xl text-trust-blue uppercase">Programa de Sponsors</h1>
        <Button 
          onClick={generateWeeklyMessages}
          className="bg-green-500 hover:bg-green-600 rounded-full font-barlow font-bold uppercase"
          data-testid="generate-weekly-btn"
        >
          <FaWhatsapp className="w-4 h-4 mr-2" />
          Generar Mensajes Semanales
        </Button>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-yellow-800 text-sm">
          <strong>💡 Consejo:</strong> Cada viernes, genera los mensajes de WhatsApp para enviar 
          a todos los sponsors con ganancias pendientes. Los mensajes incluyen el resumen semanal.
        </p>
      </div>
      
      {sponsors.length > 0 ? (
        <div className="space-y-4">
          {sponsors.map((sponsor, index) => (
            <Card key={sponsor.user.id} className="border-0 shadow-trust">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-win-gold rounded-full flex items-center justify-center font-barlow font-bold text-lg">
                      {sponsor.user.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-barlow font-bold text-lg">{sponsor.user.full_name}</p>
                      <p className="text-sm text-slate-500">Código: <span className="font-mono font-bold">{sponsor.user.sponsor_code}</span></p>
                      <p className="text-sm text-slate-500">{sponsor.user.whatsapp}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="font-barlow font-black text-xl text-green-600">${sponsor.total_earnings?.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Total Ganado</p>
                    </div>
                    <div className="text-center">
                      <p className="font-barlow font-black text-xl text-yellow-600">${sponsor.pending_earnings?.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Pendiente</p>
                    </div>
                    <div className="text-center">
                      <p className="font-barlow font-black text-xl">{sponsor.total_sales}</p>
                      <p className="text-xs text-slate-500">Ventas</p>
                    </div>
                    
                    {sponsor.pending_earnings > 0 && (
                      <Button
                        onClick={() => payAllPending(sponsor.user.id)}
                        className="bg-trust-blue rounded-full font-barlow uppercase text-sm"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Marcar Pagado
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="py-12 text-center">
            <Gift className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No hay sponsors con ganancias aún</p>
          </CardContent>
        </Card>
      )}
      
      {/* Weekly Messages Modal */}
      <Dialog open={showMessagesModal} onOpenChange={setShowMessagesModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-barlow text-xl text-trust-blue uppercase">
              Mensajes de WhatsApp Semanales
            </DialogTitle>
          </DialogHeader>
          
          {weeklyMessages.length > 0 ? (
            <div className="space-y-4">
              {weeklyMessages.map((msg, index) => (
                <Card key={index} className="border border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold">{msg.sponsor_name}</p>
                        <p className="text-sm text-slate-500">{msg.whatsapp}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-barlow font-black text-lg text-green-600">${msg.total_pending?.toFixed(2)}</p>
                        <p className="text-xs text-slate-500">{msg.sales_count} ventas</p>
                      </div>
                    </div>
                    <a
                      href={msg.whatsapp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium"
                    >
                      <FaWhatsapp className="w-4 h-4" />
                      Abrir WhatsApp
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500">No hay mensajes pendientes esta semana</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessagesModal(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Withdrawals Management (Payment Requests from Sponsors)
const WithdrawalsManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchRequests();
  }, []);
  
  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/payment-requests`);
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async (requestId) => {
    try {
      await axios.put(`${API_URL}/admin/payment-requests/${requestId}/approve`);
      toast.success("Solicitud aprobada");
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error al aprobar");
    }
  };
  
  const handleReject = async (requestId) => {
    try {
      await axios.put(`${API_URL}/admin/payment-requests/${requestId}/reject`);
      toast.success("Solicitud rechazada");
      fetchRequests();
    } catch (error) {
      toast.error("Error al rechazar");
    }
  };
  
  const handleMarkPaid = async (requestId) => {
    try {
      await axios.put(`${API_URL}/admin/payment-requests/${requestId}/mark-paid`);
      toast.success("Pago marcado como realizado");
      fetchRequests();
    } catch (error) {
      toast.error("Error al marcar como pagado");
    }
  };
  
  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Aprobado", className: "bg-blue-100 text-blue-800" },
      paid: { label: "Pagado", className: "bg-green-100 text-green-800" },
      rejected: { label: "Rechazado", className: "bg-red-100 text-red-800" }
    };
    return badges[status] || badges.pending;
  };
  
  if (loading) {
    return <div className="animate-pulse">Cargando...</div>;
  }
  
  const pendingRequests = requests.filter(r => r.status === "pending");
  const approvedRequests = requests.filter(r => r.status === "approved");
  const completedRequests = requests.filter(r => r.status === "paid" || r.status === "rejected");
  
  return (
    <div>
      <h1 className="font-barlow font-bold text-2xl text-trust-blue uppercase mb-6">
        Solicitudes de Retiro
      </h1>
      
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="font-barlow font-bold text-lg text-yellow-600 uppercase mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Pendientes de Aprobación ({pendingRequests.length})
          </h2>
          <div className="space-y-4">
            {pendingRequests.map((req) => (
              <Card key={req.id} className="border-0 shadow-trust border-l-4 border-l-yellow-500">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-barlow font-bold text-lg">{req.sponsor_name}</h3>
                        <Badge className={getStatusBadge(req.status).className}>
                          {getStatusBadge(req.status).label}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">
                        {req.sponsor_email} • {req.sponsor_whatsapp}
                      </p>
                      <div className="bg-slate-50 rounded-lg p-3 mt-3">
                        <p className="text-sm"><strong>Banco:</strong> {req.bank_name}</p>
                        <p className="text-sm"><strong>Cuenta:</strong> {req.account_number}</p>
                        <p className="text-sm"><strong>Titular:</strong> {req.account_holder}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-barlow font-black text-3xl text-green-600 mb-2">
                        ${req.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500 mb-4">
                        {new Date(req.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() => handleReject(req.id)}
                          variant="outline"
                          className="text-red-500 border-red-300 hover:bg-red-50 rounded-full"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rechazar
                        </Button>
                        <Button
                          onClick={() => handleApprove(req.id)}
                          className="bg-green-500 hover:bg-green-600 rounded-full"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Aprobar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Approved Requests (need to be paid) */}
      {approvedRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="font-barlow font-bold text-lg text-blue-600 uppercase mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Aprobados - Pendientes de Pago ({approvedRequests.length})
          </h2>
          <div className="space-y-4">
            {approvedRequests.map((req) => (
              <Card key={req.id} className="border-0 shadow-trust border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-barlow font-bold text-lg">{req.sponsor_name}</h3>
                        <Badge className={getStatusBadge(req.status).className}>
                          {getStatusBadge(req.status).label}
                        </Badge>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 mt-2">
                        <p className="text-sm"><strong>Banco:</strong> {req.bank_name}</p>
                        <p className="text-sm"><strong>Cuenta:</strong> {req.account_number}</p>
                        <p className="text-sm"><strong>Titular:</strong> {req.account_holder}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-barlow font-black text-3xl text-blue-600 mb-4">
                        ${req.amount.toFixed(2)}
                      </p>
                      <Button
                        onClick={() => handleMarkPaid(req.id)}
                        className="bg-trust-blue hover:bg-trust-blue/90 rounded-full"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Marcar como Pagado
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Completed Requests */}
      {completedRequests.length > 0 && (
        <div>
          <h2 className="font-barlow font-bold text-lg text-slate-600 uppercase mb-4">
            Historial ({completedRequests.length})
          </h2>
          <Card className="border-0 shadow-trust">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sponsor</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedRequests.slice(0, 20).map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <p className="font-medium">{req.sponsor_name}</p>
                        <p className="text-xs text-slate-500">{req.sponsor_email}</p>
                      </TableCell>
                      <TableCell>
                        <p>{req.bank_name}</p>
                        <p className="text-xs text-slate-500">***{req.account_number.slice(-4)}</p>
                      </TableCell>
                      <TableCell className="font-barlow font-bold">${req.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(req.status).className}>
                          {getStatusBadge(req.status).label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {new Date(req.created_at).toLocaleDateString("es-ES")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
      
      {requests.length === 0 && (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="py-12 text-center">
            <Banknote className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No hay solicitudes de retiro</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// WhatsApp Configuration
const WhatsAppConfig = () => {
  const [config, setConfig] = useState({ business_whatsapp: "", business_name: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    fetchConfig();
  }, []);
  
  const fetchConfig = async () => {
    try {
      const response = await axios.get(`${API_URL}/config/business`);
      setConfig(response.data);
    } catch (error) {
      console.error("Error fetching config:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${API_URL}/config/business`, config);
      toast.success("Configuración de WhatsApp guardada");
    } catch (error) {
      toast.error("Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="animate-pulse">Cargando...</div>;
  }
  
  return (
    <div>
      <h1 className="font-barlow font-bold text-2xl text-trust-blue uppercase mb-6">
        Configuración de WhatsApp
      </h1>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-trust">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FaWhatsapp className="w-6 h-6 text-green-500" />
              Click-to-Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-6">
              Configura tu número de WhatsApp Business para recibir notificaciones 
              automáticas cuando los usuarios reserven números en tus rifas.
            </p>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="business_name">Nombre del Negocio</Label>
                <Input
                  id="business_name"
                  value={config.business_name}
                  onChange={(e) => setConfig({ ...config, business_name: e.target.value })}
                  placeholder="SuerteApp"
                  data-testid="business-name-input"
                />
              </div>
              
              <div>
                <Label htmlFor="business_whatsapp">Número de WhatsApp</Label>
                <Input
                  id="business_whatsapp"
                  value={config.business_whatsapp}
                  onChange={(e) => setConfig({ ...config, business_whatsapp: e.target.value })}
                  placeholder="+573001234567"
                  data-testid="business-whatsapp-input"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Incluye el código de país (ej: +57 para Colombia, +1 para USA)
                </p>
              </div>
              
              <Button 
                type="submit" 
                disabled={saving}
                className="w-full bg-green-500 hover:bg-green-600 rounded-full font-barlow font-bold uppercase"
                data-testid="save-whatsapp-config-btn"
              >
                <FaWhatsapp className="w-4 h-4 mr-2" />
                {saving ? "Guardando..." : "Guardar Configuración"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-trust">
          <CardHeader>
            <CardTitle className="text-lg">¿Cómo funciona?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-trust-blue text-white rounded-full flex items-center justify-center flex-shrink-0 font-barlow font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Usuario selecciona números</p>
                <p className="text-sm text-slate-500">El usuario elige los números que desea comprar en la rifa</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-trust-blue text-white rounded-full flex items-center justify-center flex-shrink-0 font-barlow font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Clic en "Reservar por WhatsApp"</p>
                <p className="text-sm text-slate-500">Se abre WhatsApp con mensaje prellenado con los datos de la compra</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-trust-blue text-white rounded-full flex items-center justify-center flex-shrink-0 font-barlow font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Recibes el mensaje</p>
                <p className="text-sm text-slate-500">El mensaje llega a tu WhatsApp con nombre, cédula, números y total</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-barlow font-bold">
                4
              </div>
              <div>
                <p className="font-medium">Confirmas y registras el pago</p>
                <p className="text-sm text-slate-500">Cuando recibas el pago, confírmalo desde el panel de Pagos</p>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <p className="text-green-800 text-sm">
                <strong>💡 Ventaja:</strong> No necesitas APIs costosas como Twilio. 
                Los mensajes se envían directamente desde el celular del usuario a tu WhatsApp Business.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main Admin Page
export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="px-4 py-3 flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/dashboard" className="text-sm text-slate-500 hover:text-trust-blue">
              ← Volver al Dashboard
            </Link>
          </div>
        </header>
        
        <main className="p-4 md:p-8">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="raffles" element={<RafflesManagement />} />
            <Route path="payments" element={<PaymentsManagement />} />
            <Route path="sponsors" element={<SponsorsManagement />} />
            <Route path="payment-methods" element={<PaymentMethodsManagement />} />
            <Route path="whatsapp" element={<WhatsAppConfig />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
