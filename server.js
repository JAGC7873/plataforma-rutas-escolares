const express = require('express');
const { GoogleGenAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

// Inicializar la API de Gemini usando la variable de entorno
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Ruta de prueba para verificar que el servidor esté activo
app.get('/', (req, res) => {
  res.send('Sistema de Rutas Escolaares Activo y Corriendo.');
});

// Ruta de diagnóstico requerida por Render
app.get('/healthz', (req, res) => {
  res.sendStatus(200);
});

// Ruta principal que recibirá las ausencias desde Google Forms
app.post('/webhook/ausencia', async (req, res) => {
  try {
    const datosFormulario = req.body;
    
    // Configurar el modelo de inteligencia artificial
    const model = ai.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor de rutas corriendo correctamente en el puerto ${PORT}`);
});
