import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Array in memoria per le prenotazioni
let listaPrenotazioni = [];

// Endpoint per inviare una prenotazione
app.post("/prenota", (req, res) => {
    const { nome, telefono, persone, orario } = req.body;
    if (!nome || !telefono || !persone || !orario) {
        return res.status(400).json({ message: "Dati mancanti" });
    }
    const nuovaPrenotazione = {
        id: Date.now(),
        nome,
        telefono,
        persone,
        orario,
        giorno: new Date().toISOString()
    };
    listaPrenotazioni.push(nuovaPrenotazione);
    res.json({ message: "Prenotazione ricevuta!" });
});

// Endpoint per ottenere tutte le prenotazioni (JSON)
app.get("/prenotazioni", (req, res) => {
    res.json(listaPrenotazioni);
});

// Serve i file HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/prenotazioni.html", (req, res) => {
    res.sendFile(path.join(__dirname, "prenotazioni.html"));
});

// Serve cartelle suoni e foto
app.use("/suoni", express.static(path.join(__dirname, "suoni")));
app.use("/foto", express.static(path.join(__dirname, "foto")));

app.listen(PORT, () => {
    console.log(`Server avviato sulla porta ${PORT}`);
});
