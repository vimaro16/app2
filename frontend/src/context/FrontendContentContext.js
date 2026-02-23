import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FrontendContentContext = createContext();

export function useFrontendContent() {
  const context = useContext(FrontendContentContext);
  if (!context) {
    throw new Error("useFrontendContent must be used within a FrontendContentProvider");
  }
  return context;
}

export function FrontendContentProvider({ children }) {
  const [content, setContent] = useState({
    hero_title: "Tu Suerte Comienza Aquí",
    hero_subtitle: "Participa en rifas emocionantes con premios increíbles. Elige tus números de la suerte y gana desde tu móvil.",
    hero_button_text: "Participar Ahora",
    hero_image_url: "https://images.pexels.com/photos/6612233/pexels-photo-6612233.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    logo_url: "https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4",
    primary_color: "#003366",
    secondary_color: "#28a745",
    feature1_title: "Grandes Premios",
    feature1_description: "Participa por increíbles premios cada semana",
    feature2_title: "100% Seguro",
    feature2_description: "Transacciones protegidas y transparentes",
    feature3_title: "Desde tu Móvil",
    feature3_description: "Compra tus números desde cualquier lugar",
    feature4_title: "Fácil y Rápido",
    feature4_description: "Elige tus números y paga en segundos",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API}/frontend/content`);
      setContent(response.data);
    } catch (error) {
      console.error("Error fetching frontend content:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async (newContent) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/frontend/content`, newContent, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchContent();
      return true;
    } catch (error) {
      console.error("Error updating content:", error);
      throw error;
    }
  };

  return (
    <FrontendContentContext.Provider value={{ content, loading, updateContent, refreshContent: fetchContent }}>
      {children}
    </FrontendContentContext.Provider>
  );
}
