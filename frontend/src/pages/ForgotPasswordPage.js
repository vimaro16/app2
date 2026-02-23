import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Por favor ingresa tu email");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/forgot-password`, { email });
      toast.success(response.data.message);
      setEmailSent(true);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error al enviar el email");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">✅ Email Enviado</CardTitle>
            <CardDescription className="text-center">
              Revisa tu correo electrónico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              Si tu email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
            </p>
            <div className="text-center space-y-2">
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                className="w-full"
              >
                Volver al Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">🔐 Recuperar Contraseña</CardTitle>
          <CardDescription className="text-center">
            Ingresa tu email para recibir un enlace de recuperación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar Enlace de Recuperación"}
            </Button>

            <div className="text-center text-sm">
              <Link to="/login" className="text-trust-blue hover:underline">
                Volver al Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
