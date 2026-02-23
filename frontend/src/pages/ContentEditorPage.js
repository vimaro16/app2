import { useState, useEffect } from "react";
import { Palette, Save, RefreshCw, Image as ImageIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { useFrontendContent } from "../context/FrontendContentContext";

export default function ContentEditorPage() {
  const { content, updateContent, refreshContent } = useFrontendContent();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    setFormData(content);
  }, [content]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateContent(formData);
      toast.success("Contenido actualizado exitosamente");
      await refreshContent();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error al actualizar el contenido");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(content);
    toast.info("Cambios descartados");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-barlow font-bold text-trust-blue uppercase">Editar Contenido del Sitio</h1>
          <p className="text-slate-600 mt-2">Personaliza textos, imágenes y colores de la página principal</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Descartar Cambios
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hero">Sección Hero</TabsTrigger>
          <TabsTrigger value="features">Características</TabsTrigger>
          <TabsTrigger value="branding">Marca & Colores</TabsTrigger>
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
        </TabsList>

        {/* Hero Section Tab */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sección Principal (Hero)</CardTitle>
              <CardDescription>Personaliza el texto y la imagen de la sección principal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero_title">Título Principal</Label>
                <Input
                  id="hero_title"
                  value={formData.hero_title || ""}
                  onChange={(e) => handleChange("hero_title", e.target.value)}
                  placeholder="Tu Suerte Comienza Aquí"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero_subtitle">Subtítulo</Label>
                <Textarea
                  id="hero_subtitle"
                  value={formData.hero_subtitle || ""}
                  onChange={(e) => handleChange("hero_subtitle", e.target.value)}
                  placeholder="Descripción corta..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero_button_text">Texto del Botón</Label>
                <Input
                  id="hero_button_text"
                  value={formData.hero_button_text || ""}
                  onChange={(e) => handleChange("hero_button_text", e.target.value)}
                  placeholder="Participar Ahora"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero_image_url">URL de Imagen de Fondo</Label>
                <Input
                  id="hero_image_url"
                  value={formData.hero_image_url || ""}
                  onChange={(e) => handleChange("hero_image_url", e.target.value)}
                  placeholder="https://..."
                />
                {formData.hero_image_url && (
                  <div className="mt-2 rounded-lg overflow-hidden border">
                    <img 
                      src={formData.hero_image_url} 
                      alt="Hero preview" 
                      className="w-full h-48 object-cover"
                      onError={(e) => e.target.src = "https://via.placeholder.com/800x400?text=Error+al+cargar+imagen"}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Características del Servicio</CardTitle>
              <CardDescription>Edita las 4 características principales que se muestran en la página</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="border-b pb-4 last:border-0">
                  <h3 className="font-semibold text-trust-blue mb-3">Característica {num}</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor={`feature${num}_title`}>Título</Label>
                      <Input
                        id={`feature${num}_title`}
                        value={formData[`feature${num}_title`] || ""}
                        onChange={(e) => handleChange(`feature${num}_title`, e.target.value)}
                        placeholder="Título de la característica"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`feature${num}_description`}>Descripción</Label>
                      <Textarea
                        id={`feature${num}_description`}
                        value={formData[`feature${num}_description`] || ""}
                        onChange={(e) => handleChange(`feature${num}_description`, e.target.value)}
                        placeholder="Descripción breve"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Marca y Colores</CardTitle>
              <CardDescription>Personaliza el logo y los colores del sitio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo_url">URL del Logo</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url || ""}
                  onChange={(e) => handleChange("logo_url", e.target.value)}
                  placeholder="https://..."
                />
                {formData.logo_url && (
                  <div className="mt-2 flex items-center justify-center p-4 bg-slate-50 rounded-lg">
                    <img 
                      src={formData.logo_url} 
                      alt="Logo preview" 
                      className="h-16 object-contain"
                      onError={(e) => e.target.src = "https://via.placeholder.com/100?text=Logo"}
                    />
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Color Primario</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="primary_color"
                      value={formData.primary_color || "#003366"}
                      onChange={(e) => handleChange("primary_color", e.target.value)}
                      className="w-20 h-12 p-1"
                    />
                    <Input
                      value={formData.primary_color || "#003366"}
                      onChange={(e) => handleChange("primary_color", e.target.value)}
                      placeholder="#003366"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Color principal del sitio (botones, títulos, etc.)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Color Secundario</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="secondary_color"
                      value={formData.secondary_color || "#28a745"}
                      onChange={(e) => handleChange("secondary_color", e.target.value)}
                      className="w-20 h-12 p-1"
                    />
                    <Input
                      value={formData.secondary_color || "#28a745"}
                      onChange={(e) => handleChange("secondary_color", e.target.value)}
                      placeholder="#28a745"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Color secundario (acentos, badges, etc.)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
              <CardDescription>Cómo se verán los cambios en la página principal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hero Preview */}
              <div className="border rounded-lg overflow-hidden">
                <div 
                  className="relative h-64 bg-cover bg-center"
                  style={{ backgroundImage: `url(${formData.hero_image_url})` }}
                >
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-4">
                    <h1 className="text-3xl font-bold mb-4 text-center">{formData.hero_title}</h1>
                    <p className="text-center mb-6 max-w-2xl">{formData.hero_subtitle}</p>
                    <button 
                      className="px-6 py-3 rounded-full font-semibold"
                      style={{ backgroundColor: formData.primary_color }}
                    >
                      {formData.hero_button_text}
                    </button>
                  </div>
                </div>
              </div>

              {/* Features Preview */}
              <div className="grid md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="p-4 border rounded-lg text-center">
                    <div 
                      className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white"
                      style={{ backgroundColor: formData.secondary_color }}
                    >
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold mb-2" style={{ color: formData.primary_color }}>
                      {formData[`feature${num}_title`]}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {formData[`feature${num}_description`]}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
