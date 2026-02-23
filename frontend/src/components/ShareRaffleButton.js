import { useState, useEffect } from "react";
import { Share2, Facebook, Twitter, Copy, Check } from "lucide-react";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL + "/api";

export default function ShareRaffleButton({ raffleId }) {
  const [shareLinks, setShareLinks] = useState(null);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchShareLinks();
    }
  }, [open]);

  const fetchShareLinks = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Debes iniciar sesión para compartir");
        setOpen(false);
        return;
      }

      const response = await axios.get(`${API_URL}/raffles/${raffleId}/share`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShareLinks(response.data);
    } catch (error) {
      console.error("Error fetching share links:", error);
      toast.error("Error al generar links de compartir");
    }
  };

  const copyToClipboard = async () => {
    if (!shareLinks) return;
    
    try {
      await navigator.clipboard.writeText(shareLinks.copy_link);
      setCopied(true);
      toast.success("¡Link copiado al portapapeles!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Error al copiar el link");
    }
  };

  const openSocialMedia = (platform) => {
    if (!shareLinks) return;
    
    const urls = {
      facebook: shareLinks.facebook,
      twitter: shareLinks.twitter,
      whatsapp: shareLinks.whatsapp,
      telegram: shareLinks.telegram
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="w-4 h-4" />
          Compartir y Ganar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Comparte y Gana Comisiones 💰</DialogTitle>
        </DialogHeader>
        
        {shareLinks && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 mb-2">
                <strong>Tu código de sponsor:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{shareLinks.sponsor_code}</code>
              </p>
              <p className="text-xs text-blue-700">
                Ganas 10% de comisión por cada compra con tu código
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Compartir en:</p>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => openSocialMedia('facebook')}
                  className="gap-2 bg-[#1877f2] hover:bg-[#1877f2]/90"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Button>
                
                <Button
                  onClick={() => openSocialMedia('twitter')}
                  className="gap-2 bg-[#1da1f2] hover:bg-[#1da1f2]/90"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>
                
                <Button
                  onClick={() => openSocialMedia('whatsapp')}
                  className="gap-2 bg-[#25d366] hover:bg-[#25d366]/90"
                >
                  <FaWhatsapp className="w-4 h-4" />
                  WhatsApp
                </Button>
                
                <Button
                  onClick={() => openSocialMedia('telegram')}
                  className="gap-2 bg-[#0088cc] hover:bg-[#0088cc]/90"
                >
                  <FaTelegram className="w-4 h-4" />
                  Telegram
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">O copia el link:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLinks.copy_link}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-md text-sm bg-slate-50"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copiado" : "Copiar"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
