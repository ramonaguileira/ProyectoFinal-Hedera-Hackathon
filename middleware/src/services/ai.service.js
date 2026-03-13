const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require("../config/env");
const logger = require("../utils/logger");

// Use provided Gemini key or fallback to a placeholder (user will need to provide it)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

async function processOperatorInput(text, mediaFiles = []) {
  // 1. Initial fallback/template
  let extracted = { 
    supplier_id: text || "Desconocido", 
    kg_brutos: 0, 
    pct_impropios: 0, 
    waste_type: 'organico' 
  };

  if (!genAI) {
    logger.warn("Gemini API key missing. Using basic extraction.");
    // Simple regex fallback for weight if text is present
    if (text) {
      const kgMatch = text.match(/(\d+)\s*(kg|kilos|k)/i);
      if (kgMatch) extracted.kg_brutos = parseFloat(kgMatch[1]);
    }
    return extracted;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    let prompt = `
      Eres el asistente inteligente de Eggologic. Tu misión es extraer datos de una entrega de residuos.
      Recibirás texto, audio o imagen.
      
      Debes devolver un JSON con esta estructura exacta:
      {
        "supplier_id": "Nombre del proveedor",
        "kg_brutos": 123.45,
        "pct_impropios": 0.1, 
        "waste_type": "organico",
        "is_complete": true,
        "missing_info": "",
        "empty_optional_fields": [],
        "follow_up_suggestion": "",
        "external_id": "id_unico"
      }

      REGLAS DE ORO:
      1. pct_impropios debe ser DECIMAL (0.1 = 10%, 0.05 = 5%). Si dicen "diez por ciento", pon 0.1.
      2. supplier_id y kg_brutos son OBLIGATORIOS. Si no están claros, is_complete = false.
      3. Si falta pct_impropios o waste_type, agrégalos a empty_optional_fields y crea una follow_up_suggestion amable.
      4. Si hay un audio, escúchalo con atención. Los operadores suelen hablar rápido.
      5. Responde SOLO el JSON.
    `;

    const parts = [{ text: prompt }];
    
    // Add text if provided
    if (text) {
      parts.push({ text: `Mensaje del operador: "${text}"` });
    }

    // Add media files (base64 + mimeType)
    mediaFiles.forEach(file => {
      parts.push({
        inlineData: {
          mimeType: file.mimeType,
          data: file.data
        }
      });
    });

    const result = await model.generateContent(parts);
    const response = await result.response;
    const cleanJson = response.text().replace(/```json|```/g, "").trim();
    
    try {
      const parsed = JSON.parse(cleanJson);
      
      // Inject real unique ID if Gemini didn't make a good one
      if (!parsed.external_id) {
        const ts = new Date().getTime();
        parsed.external_id = `${parsed.supplier_id || 'unkn'}_${ts}`.replace(/\s+/g, '_').toLowerCase();
      }

      logger.info(`Gemini extracted: ${JSON.stringify(parsed)}`);
      return parsed;
    } catch (parseErr) {
      logger.error(`Error parsing Gemini JSON: ${cleanJson}`);
      return extracted;
    }
  } catch (err) {
    logger.error(`Gemini processing error: ${err.message}`);
    return extracted;
  }
}

module.exports = { processOperatorInput };
