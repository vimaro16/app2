import { useState, useEffect } from "react";
import { Trophy, TrendingUp } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL + "/api";

export default function TopBuyerCard({ raffleId }) {
  const [topBuyer, setTopBuyer] = useState(null);

  useEffect(() => {
    fetchTopBuyer();
  }, [raffleId]);

  const fetchTopBuyer = async () => {
    try {
      const response = await axios.get(`${API_URL}/raffles/${raffleId}/top-buyer`);
      setTopBuyer(response.data);
    } catch (error) {
      console.error("Error fetching top buyer:", error);
    }
  };

  if (!topBuyer) return null;

  return (
    <Card className="border-2 border-win-gold bg-gradient-to-br from-win-gold/10 to-transparent">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-win-gold rounded-full flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-barlow font-bold text-lg">🏆 Líder de la Rifa</h3>
              <Badge className="bg-win-gold text-slate-900">
                <TrendingUp className="w-3 h-3 mr-1" />
                Top 1
              </Badge>
            </div>
            <p className="text-2xl font-barlow font-black text-trust-blue mb-1">
              {topBuyer.user_name}
            </p>
            <div className="space-y-1 text-sm text-slate-600">
              <p>
                <strong>{topBuyer.total_slots}</strong> números comprados
              </p>
              <p>
                Total invertido: <strong className="text-success-green">${topBuyer.total_spent.toFixed(2)}</strong>
              </p>
              {topBuyer.sponsor_code && (
                <p className="text-xs mt-2">
                  Código: <code className="bg-slate-100 px-2 py-1 rounded">{topBuyer.sponsor_code}</code>
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
