const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// Apri o crea il database
const db = new sqlite3.Database("prenotazioni.db", (err) => {
    if (err) console.error("Errore apertura DB:", err.message);
    else console.log("Database pronto.");
});

// Crea la tabella prenotazioni se non esiste
db.run(`CREATE TABLE IF NOT EXISTS prenotazioni (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefono TEXT NOT NULL,
    persone INTEGER NOT NULL,
    orario TEXT NOT NULL,
    giorno TEXT NOT NULL
)`);

// Endpoint per salvare una prenotazione
app.post("/prenota", (req, res) => {
    const { nome, telefono, persone, orario } = req.body;
    if (!nome || !telefono || !persone || !orario) {
        return res.status(400).json({ message: "Compila tutti i campi" });
    }
    const giorno = new Date().toLocaleString();

    const sql = `INSERT INTO prenotazioni (nome, telefono, persone, orario, giorno) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [nome, telefono, persone, orario, giorno], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: "Errore nel salvataggio" });
        }
        res.json({ message: "Prenotazione salvata!" });
    });
});

// Endpoint per vedere tutte le prenotazioni
app.get("/prenotazioni", (req, res) => {
    db.all("SELECT * FROM prenotazioni ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send("Errore lettura prenotazioni");
        }

        let html = `
        <html>
        <head>
            <title>Prenotazioni Pizzeria</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
                th { background-color: #f4a261; color: white; }
                tr:nth-child(even) { background-color: #f9f9f9; }
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
        rows.forEach(row => {
            html += `
                <tr>
                    <td>${row.nome}</td>
                    <td>${row.telefono}</td>
                    <td>${row.persone}</td>
                    <td>${row.orario}</td>
                    <td>${row.giorno}</td>
                </tr>
            `;
        });

        html += `
            </table>
        </body>
        </html>
        `;

        res.send(html);
    });
});

// Endpoint per cancellare tutte le prenotazioni
app.get("/cancella", (req, res) => {
    db.run("DELETE FROM prenotazioni", [], function(err) {
        if (err) {
            console.error(err.message);
            return res.send("Errore durante la cancellazione");
        }
        res.send("<h1>Tutte le prenotazioni sono state cancellate!</h1>");
    });
});

// Servi la pagina principale
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Avvia il server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server in ascolto su http://localhost:${PORT}`);
});
