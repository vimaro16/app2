import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Calendar, ArrowRight, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL + "/api";

export default function BlogPage() {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchArchivedRaffles();
  }, []);

  const fetchArchivedRaffles = async () => {
    try {
      const response = await axios.get(`${API_URL}/blog`);
      setRaffles(response.data);
    } catch (error) {
      console.error("Error fetching archived raffles:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRaffles = raffles.filter(raffle => 
    raffle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    raffle.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-trust-blue rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="font-barlow font-bold text-xl text-trust-blue uppercase tracking-wider">SuerteApp</span>
          </Link>
          
          <Link to="/">
            <Button variant="outline" className="rounded-full font-barlow uppercase text-sm">
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-trust-blue to-blue-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-barlow font-black text-3xl md:text-4xl uppercase tracking-tight mb-4">
            Archivo de Rifas
          </h1>
          <p className="text-blue-200 max-w-2xl mx-auto">
            Revisa el historial de todas las rifas finalizadas y sus ganadores
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar rifas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-full"
              data-testid="blog-search-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue"></div>
          </div>
        ) : filteredRaffles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRaffles.map((raffle, index) => (
              <motion.div
                key={raffle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  data-testid={`blog-raffle-${index}`}
                  className="overflow-hidden border-0 shadow-trust hover:shadow-xl transition-all"
                >
                  {raffle.finish_image_url || raffle.image_url ? (
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={raffle.finish_image_url || raffle.image_url} 
                        alt={raffle.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-slate-800/80 text-white">
                          {raffle.status === "finished" ? "Finalizada" : "Cerrada"}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-slate-100 flex items-center justify-center">
                      <Trophy className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <h3 className="font-barlow font-bold text-xl text-trust-blue uppercase mb-2">
                      {raffle.title}
                    </h3>
                    
                    {raffle.finish_text ? (
                      <p className="text-slate-600 mb-4 line-clamp-3">{raffle.finish_text}</p>
                    ) : (
                      <p className="text-slate-600 mb-4 line-clamp-3">{raffle.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {raffle.finished_at 
                            ? new Date(raffle.finished_at).toLocaleDateString("es-ES", { 
                                day: "numeric", 
                                month: "long", 
                                year: "numeric" 
                              })
                            : "N/A"
                          }
                        </span>
                      </div>
                      <span className="font-barlow font-bold">${raffle.slot_price} c/n</span>
                    </div>
                    
                    {raffle.finish_video_url && (
                      <div className="mt-4 rounded-lg overflow-hidden">
                        <iframe
                          src={raffle.finish_video_url.replace("watch?v=", "embed/")}
                          title="Video del ganador"
                          className="w-full aspect-video"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-slate-200 max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">
                {searchTerm ? "No se encontraron rifas" : "No hay rifas archivadas aún"}
              </p>
              <Link to="/">
                <Button className="bg-trust-blue rounded-full font-barlow uppercase">
                  Ver Rifas Activas <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-trust-blue text-white py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Trophy className="w-4 h-4 text-trust-blue" />
            </div>
            <span className="font-barlow font-bold text-lg uppercase tracking-wider">SuerteApp</span>
          </div>
          <p className="text-blue-200 text-sm">
            © 2025 SuerteApp. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
