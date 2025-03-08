const express = require('express');
const path = require('path');
require('dotenv').config();
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3500;
const ApiKey = process.env.ApiKey;

if (!ApiKey) {
  console.error('Error: No se encontró la API key de Gemini AI en el archivo .env');
  process.exit(1);
}

// Configuración de Gemini AI
const genAI = new GoogleGenerativeAI(ApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use(express.static('public'));

// Ruta para servir la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para manejar el envío del formulario de emergencia
app.post('/submit-emergency', async (req, res) => {
    const formData = req.body;
    console.log('Datos del formulario:', formData);

    try {
        // Crear el prompt para Gemini AI
        const prompt = `El paciente ${formData.nombre}, nacido en ${formData.fechaNacimiento}, reportó la siguiente emergencia: ${formData.descripcion}. 
                        La gravedad es ${formData.gravedad}, la duracion de los sintomas es ${formData.duracion} y la localización del síntoma es ${formData.localizacion}. 
                        Es alergico a ${formData.alergias}, toma medicamentos ${formData.medicamentos} y tiene antecedentes de ${formData.antecedentes}, posee condiciones especiales ${formData.condicionesEspeciales}.
                        Ha tenido cirugias ${formData.cirugias} y hospitalizaciones ${formData.hospitalizaciones}.
                        La emergencia ocurrió el ${formData.fechaEmergencia}.
                        ¿Qué recomendaciones podrías dar?`;

        // Generar contenido con Gemini AI
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Enviar la respuesta al frontend
        res.json({ success: true, message: 'Formulario enviado correctamente', geminiResponse: text });
    } catch (error) {
        console.error('Error al generar contenido con Gemini AI:', error);
        res.status(500).json({ success: false, message: 'Error al procesar la solicitud' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


