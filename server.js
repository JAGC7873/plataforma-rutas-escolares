const express = require('express');
const { GoogleGenAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

// ASÍ SE INICIALIZA REALMENTE: Usando la clase correcta de la SDK oficial
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Ruta de prueba para verificar que el servidor esté activo desde el navegador
app.get('/', (req, res) => {
  res.send('Sistema de Rutas Escolares Activo y Corriendo.');
});

// Ruta de diagnóstico requerida por Render para verificar la salud del servidor
app.get('/healthz', (req, res) => {
  res.sendStatus(200);
});

// Ruta principal (Webhook) que recibirá las ausencias desde Google Forms o AppSheet
app.post('/webhook/ausencia', async (req, res) => {
  try {
    const datosFormulario = req.body;
    
    // Configuración del modelo estable actual de Gemini
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Analiza el siguiente reporte de ausencia escolar enviado por formulario y extrae de forma estructurada el nombre del estudiante, el grado, la ruta afectada y el motivo del reporte. Devuelve únicamente un objeto JSON válido con los campos: estudiante, grado, ruta, motivo.\n\nDatos del reporte: ${JSON.stringify(datosFormulario)}`;
    
    const resultado = await model.generateContent(prompt);
    const respuestaTexto = resultado.response.text();
    
    console.log("Análisis de Gemini completado con éxito.");
    
    res.status(200).json({
      success: true,
      analisis: respuestaTexto
    });
  } catch (error) {
    console.error("Error procesando la solicitud con Gemini:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Puerto dinámico asignado por Render o el puerto 10000 por defecto
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor de rutas corriendo correctamente en el puerto ${PORT}`);
});
