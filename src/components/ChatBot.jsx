import { useState, useRef, useEffect } from "react";

// ==============================================================================
// 1. PEGA AQUÍ TU API KEY DE GOOGLE
// ==============================================================================
const GOOGLE_API_KEY = "AIzaSyDNX1vzK3WggwG0vVwkcjauM-DmIfn14_w"; 

// 2. CONTEXTO DEL HOTEL
const SYSTEM_INSTRUCTION = `
Eres "Río", el asistente virtual experto del "Bosque y Río Lodge".
Tus respuestas deben ser:
1. Breves y directas (máximo 3 oraciones).
2. Muy amables y acogedoras.
3. Usa emojis sureños (🌲, 🌧️, 🔥, 🛶).

INFORMACIÓN OFICIAL DEL LODGE:
- Ubicación: Ruta T-350 Km 12, Valdivia (Camino a Niebla).
- Check-in: 15:00 hrs / Check-out: 11:00 hrs.
- Desayuno: No incluido, vendemos canastas locales.
- Mascotas: SOLO permitidas en cabañas 'Coihue' y 'Lenga'.
- Internet: Fibra óptica Starlink gratis.
- Calefacción: Estufa a leña (Bosca).
- Tinajas: Costo extra, reservar 4 horas antes.
- Precios: Varían por fecha, revisar en el buscador de la web.
`;

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "¡Hola! 👋 Soy Río, tu asistente virtual. Pregúntame por cabañas, ubicación, tinajas o lo que necesites.", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeModel, setActiveModel] = useState(null); // Aquí guardaremos el modelo que funcione
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isTyping]);

  // --- AUTO-DETECTAR MODELO DISPONIBLE ---
  useEffect(() => {
    if (GOOGLE_API_KEY && !GOOGLE_API_KEY.includes("PEGA_AQUI")) {
      // Consultamos a Google qué modelos tiene tu cuenta
      fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GOOGLE_API_KEY}`)
        .then(res => res.json())
        .then(data => {
          // Buscamos el primer modelo "gemini" que sirva para generar contenido
          const validModel = data.models?.find(m => 
            m.name.includes("gemini") && 
            m.supportedGenerationMethods.includes("generateContent")
          );

          if (validModel) {
            console.log("✅ Modelo detectado y activado:", validModel.name);
            setActiveModel(validModel.name); // Guardamos el nombre exacto (ej: models/gemini-1.5-flash)
          } else {
            console.warn("⚠️ No se encontraron modelos Gemini compatibles, usando fallback.");
            setActiveModel("models/gemini-pro"); // Intento por defecto
          }
        })
        .catch(err => console.error("❌ Error al buscar modelos:", err));
    }
  }, []);

  // --- LÓGICA IA ---
  const callGemini = async (userText) => {
    if (!GOOGLE_API_KEY || GOOGLE_API_KEY.includes("PEGA_AQUI")) return null;
    
    // Si aún no detectamos modelo, usamos uno estándar por defecto
    const modelToUse = activeModel || "models/gemini-1.5-flash"; 

    try {
      // La URL ahora usa el modelo detectado dinámicamente
      const url = `https://generativelanguage.googleapis.com/v1beta/${modelToUse}:generateContent?key=${GOOGLE_API_KEY}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: `${SYSTEM_INSTRUCTION}\n\nPregunta del usuario: ${userText}` }]
          }]
        })
      });

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      }
      return null;

    } catch (error) {
      console.error("❌ Error en llamada IA:", error);
      return null;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: "user" }]);
    setInput("");
    setIsTyping(true);

    let botText = "";
    
    // Intentar IA
    const aiResponse = await callGemini(userText);
    
    if (aiResponse) {
      botText = aiResponse;
    } else {
      // Fallback básico si falla la IA
      await new Promise(r => setTimeout(r, 500));
      botText = "Lo siento, tengo problemas de conexión. Por favor escribe a reservas@bosqueyrio.cl 📧";
    }

    setMessages(prev => [...prev, { id: Date.now() + 1, text: botText, sender: "bot" }]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none font-sans">
      
      {/* VENTANA CHAT */}
      <div className={`bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mb-4 transition-all duration-300 origin-bottom-right pointer-events-auto flex flex-col ${isOpen ? "opacity-100 scale-100 translate-y-0 h-[500px]" : "opacity-0 scale-95 translate-y-10 h-0 pointer-events-none"}`}>
        
        {/* Header */}
        <div className="bg-emerald-950 p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-800 rounded-full flex items-center justify-center text-xl border border-emerald-700 shadow-inner">🤖</div>
            <div>
              <h3 className="text-white font-bold text-sm">Asistente Virtual</h3>
              <p className="text-emerald-400 text-xs flex items-center gap-1 font-medium">
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeModel ? "bg-green-500" : "bg-yellow-500"}`}></span> 
                {activeModel ? "IA Conectada" : "Iniciando..."}
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white text-xl">×</button>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === "user" ? "bg-emerald-600 text-white rounded-br-none" : "bg-white text-slate-700 border border-slate-200 rounded-bl-none"}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none flex gap-1 items-center shadow-sm">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0">
          <input 
            type="text" 
            placeholder="Escribe tu pregunta..." 
            className="flex-1 bg-slate-100 text-slate-800 text-sm px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={!input.trim() || isTyping} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm">
            ➤
          </button>
        </form>
      </div>

      {/* Trigger Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="pointer-events-auto bg-emerald-950 hover:bg-emerald-800 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 group relative border-4 border-white/20">
        <span className={`absolute transition-all duration-300 ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </span>
        <span className={`absolute transition-all duration-300 ${isOpen ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-90"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </span>
      </button>
    </div>
  );
}