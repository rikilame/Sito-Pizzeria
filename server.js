// server.js
const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config(); // per leggere le variabili da .env
console.log("URL:", process.env.SUPABASE_URL);
console.log("KEY:", process.env.SUPABASE_KEY);
const { createClient } = require("@supabase/supabase-js");

// Configura Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());
app.use(express.static(__dirname));

// Endpoint per inviare prenotazioni
app.post("/prenota", async (req, res) => {
  const { nome, telefono, persone, orario } = req.body;

  if (!nome || !telefono || !persone || !orario) {
    return res.status(400).json({ message: "Compila tutti i campi" });
  }

  try {
    const { data, error } = await supabase
      .from("prenotazioni")
      .insert([{ nome, telefono, persone, orario }]);

    if (error) throw error;

    res.json({ message: "Prenotazione salvata!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore durante il salvataggio" });
  }
});

// Endpoint per vedere tutte le prenotazioni
app.get("/prenotazioni", async (req, res) => {
  try {
    const { data, error } = await supabase.from("prenotazioni").select("*");

    if (error) throw error;

    let html = `
      <html>
        <head>
          <title>Prenotazioni Pizzeria</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 8px; }
            th { background-color: orange; color: white; }
          </style>
        </head>
        <body>
          <h1>Lista Prenotazioni</h1>
          <table>
            <tr>
              <th>Nome</th>
              <th>Telefono</th>
              <th>Persone</th>
              <th>Orario</th>
              <th>Giorno</th>
            </tr>
    `;

   data.forEach(p => {
  const giorno = new Date(p.giorno).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  
  html += `
    <tr>
      <td>${p.nome}</td>
      <td>${p.telefono}</td>
      <td>${p.persone}</td>
      <td>${p.orario}</td>
      <td>${giorno}</td>
    </tr>
  `;
});

    html += `</table></body></html>`;
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore nel recupero delle prenotazioni");
  }
});

// Serve la pagina principale
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Avvia il server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server in ascolto su http://localhost:${port}`);
});
