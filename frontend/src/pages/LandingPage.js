import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Shield, Smartphone, Star, ArrowRight, Menu, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";
import { useFrontendContent } from "../context/FrontendContentContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL + "/api";

export default function LandingPage() {
  const { user } = useAuth();
  const { content, loading: contentLoading } = useFrontendContent();
  const [raffles, setRaffles] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchActiveRaffles();
  }, []);

  const fetchActiveRaffles = async () => {
    try {
      const response = await axios.get(`${API_URL}/raffles/active`);
      setRaffles(response.data.slice(0, 3));
    } catch (error) {
      console.error("Error fetching raffles:", error);
    }
  };

  const features = [
    { title: content.feature1_title, desc: content.feature1_description },
    { title: content.feature2_title, desc: content.feature2_description },
    { title: content.feature3_title, desc: content.feature3_description },
    { title: content.feature4_title, desc: content.feature4_description },
  ];

  const featureIcons = [Trophy, Shield, Smartphone, Star];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            {content.logo_url ? (
              <img src={content.logo_url} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-trust-blue rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="font-barlow font-bold text-xl text-trust-blue uppercase tracking-wider">SuerteApp</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/blog" className="text-slate-600 hover:text-trust-blue transition-colors font-medium">Blog</Link>
            {user ? (
              <Link to="/dashboard">
                <Button data-testid="dashboard-btn" className="bg-trust-blue hover:bg-trust-blue/90 rounded-full font-barlow font-bold uppercase tracking-wider">
                  Mi Panel
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button data-testid="login-btn" variant="outline" className="rounded-full font-barlow font-bold uppercase tracking-wider border-trust-blue text-trust-blue hover:bg-trust-blue/5">
                    Ingresar
                  </Button>
                </Link>
                <Link to="/register">
                  <Button data-testid="register-btn" className="bg-luck-red hover:bg-luck-red/90 rounded-full font-barlow font-bold uppercase tracking-wider shadow-luck">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            data-testid="mobile-menu-btn"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-slate-100 p-4"
          >
            <div className="flex flex-col gap-3">
              <Link to="/blog" className="py-2 text-slate-600 font-medium">Blog</Link>
              {user ? (
                <Link to="/dashboard">
                  <Button className="w-full bg-trust-blue rounded-full font-barlow font-bold uppercase">Mi Panel</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" className="w-full rounded-full font-barlow font-bold uppercase border-trust-blue text-trust-blue">Ingresar</Button>
                  </Link>
                  <Link to="/register">
                    <Button className="w-full bg-luck-red rounded-full font-barlow font-bold uppercase">Registrarse</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 bg-gradient-to-br from-trust-blue to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-win-gold rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-luck-red rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-barlow font-black text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight mb-4 leading-tight">
              {content.hero_title}
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 font-lato leading-relaxed">
              {content.hero_subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={user ? "/dashboard" : "/register"}>
                <Button 
                  data-testid="hero-cta-btn"
                  size="lg" 
                  className="w-full sm:w-auto bg-luck-red hover:bg-luck-red/90 text-white font-barlow font-black text-lg uppercase tracking-widest rounded-full px-8 py-6 shadow-luck animate-pulse-slow"
                >
                  {content.hero_button_text} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/blog">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20 font-barlow font-bold uppercase tracking-wider rounded-full px-8 py-6"
                >
                  Ver Ganadores
                </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative hidden md:block"
          >
            <img 
              src={content.hero_image_url}
              alt="Hero"
              className="rounded-2xl shadow-2xl w-full object-cover max-h-[400px]"
            />
            <div className="absolute -bottom-6 -left-6 bg-white text-trust-blue p-4 rounded-xl shadow-xl">
              <p className="font-barlow font-black text-2xl">+500</p>
              <p className="text-sm text-slate-600">Ganadores felices</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-barlow font-bold text-2xl md:text-3xl text-trust-blue uppercase tracking-tight mb-3">
              ¿Por qué SuerteApp?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              La plataforma más confiable para participar en rifas online
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-trust hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-trust-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-6 h-6 text-trust-blue" />
                    </div>
                    <h3 className="font-barlow font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-600">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Raffles Section */}
      {raffles.length > 0 && (
        <section className="py-16 md:py-24 px-4 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-barlow font-bold text-2xl md:text-3xl text-trust-blue uppercase tracking-tight mb-3">
                Rifas Activas
              </h2>
              <p className="text-slate-600">¡No pierdas tu oportunidad de ganar!</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {raffles.map((raffle, index) => (
                <motion.div
                  key={raffle.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link to={`/raffle/${raffle.id}`}>
                    <Card 
                      data-testid={`raffle-card-${index}`}
                      className="overflow-hidden border-0 shadow-trust hover:shadow-xl transition-all hover:-translate-y-2 cursor-pointer"
                    >
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
                        <h3 className="font-barlow font-bold text-xl mb-2 text-trust-blue uppercase">{raffle.title}</h3>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{raffle.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-barlow font-black text-2xl text-luck-red">${raffle.slot_price}</span>
                          <span className="text-sm text-slate-500">por número</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link to={user ? "/dashboard" : "/register"}>
                <Button 
                  size="lg"
                  className="bg-trust-blue hover:bg-trust-blue/90 rounded-full font-barlow font-bold uppercase tracking-wider px-8"
                >
                  Ver Todas las Rifas
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-trust-blue text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-trust-blue" />
                </div>
                <span className="font-barlow font-bold text-xl uppercase tracking-wider">SuerteApp</span>
              </div>
              <p className="text-blue-200 text-sm">
                La plataforma más confiable para participar en rifas online.
              </p>
            </div>
            <div>
              <h4 className="font-barlow font-bold uppercase mb-4">Enlaces</h4>
              <div className="flex flex-col gap-2">
                <Link to="/blog" className="text-blue-200 hover:text-white transition-colors text-sm">Blog</Link>
                <Link to="/register" className="text-blue-200 hover:text-white transition-colors text-sm">Registrarse</Link>
                <Link to="/login" className="text-blue-200 hover:text-white transition-colors text-sm">Ingresar</Link>
              </div>
            </div>
            <div>
              <h4 className="font-barlow font-bold uppercase mb-4">Seguridad</h4>
              <p className="text-blue-200 text-sm">
                Todas las transacciones están protegidas con encriptación SSL. 
                Tus datos están seguros con nosotros.
              </p>
            </div>
          </div>
          <div className="border-t border-blue-400/30 mt-8 pt-8 text-center text-blue-200 text-sm">
            © 2025 SuerteApp. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
