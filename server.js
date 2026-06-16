import express from 'express';
import { GoogleGenAI } from '@google/generative-ai';

const app = express();
app.use(express.json());

// CONFIGURACIÓN REAL DE LA SDK: Se llama directamente a la función de la librería
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get('/', (req, res) => {
  res.send('Sistema de Rutas Escolares Activo y Corriendo.');
});

app.get('/healthz', (req, res) => {
  res.sendStatus(200);
});

app.post('/webhook/ausencia', async (req, res) => {
  try {
    const datosFormulario = req.body;
    
    // Acceso correcto al modelo
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor de rutas corriendo correctamente en el puerto ${PORT}`);
});
