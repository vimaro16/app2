import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, User, CreditCard, Phone, Mail, Lock, Eye, EyeOff, Gift } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    cedula: "",
    whatsapp: "",
    email: "",
    password: "",
    sponsor_code: ""
  });

  useEffect(() => {
    // Get sponsor code from URL if present
    const refCode = searchParams.get("ref");
    if (refCode) {
      setFormData(prev => ({ ...prev, sponsor_code: refCode }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const user = await register(formData);
      toast.success(`¡Bienvenido, ${user.full_name}! Tu cuenta ha sido creada.`);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-blue to-blue-900 flex items-center justify-center p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Trophy className="w-6 h-6 text-trust-blue" />
          </div>
          <span className="font-barlow font-bold text-2xl text-white uppercase tracking-wider">SuerteApp</span>
        </Link>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-barlow text-2xl text-trust-blue uppercase">Crear Cuenta</CardTitle>
            <CardDescription>Únete y comienza a ganar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="Juan Pérez"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="pl-10 h-12"
                    required
                    data-testid="register-name-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cedula">Número de cédula</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="cedula"
                    name="cedula"
                    type="text"
                    placeholder="12345678"
                    value={formData.cedula}
                    onChange={handleChange}
                    className="pl-10 h-12"
                    required
                    data-testid="register-cedula-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">Número de WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    placeholder="+573001234567"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="pl-10 h-12"
                    required
                    data-testid="register-whatsapp-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 h-12"
                    required
                    data-testid="register-email-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10 h-12"
                    required
                    minLength={6}
                    data-testid="register-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sponsor_code">Código de Referido (opcional)</Label>
                <div className="relative">
                  <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="sponsor_code"
                    name="sponsor_code"
                    type="text"
                    placeholder="Ej: ABC12345"
                    value={formData.sponsor_code}
                    onChange={handleChange}
                    className="pl-10 h-12 uppercase"
                    data-testid="register-sponsor-input"
                  />
                </div>
                <p className="text-xs text-slate-500">¿Alguien te invitó? Ingresa su código</p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-luck-red hover:bg-luck-red/90 font-barlow font-bold uppercase tracking-wider rounded-full shadow-luck"
                data-testid="register-submit-btn"
              >
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-600">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="text-trust-blue font-semibold hover:underline">
                  Ingresa aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
