const path = require("path");
const express = require("express");
const app = express();
const fs = require("fs");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
app.use(express.json());
app.use(express.static(__dirname));

app.post("/prenota", (req, res) => {
    const { nome, telefono, persone, orario } = req.body;

    // ✅ Controllo dei campi
    if (!nome || !telefono || !persone || !orario) {
        return res.status(400).json({ message: "Compila tutti i campi" });
    }

    const OraLocale = new Date().toLocaleString();
    console.log(OraLocale); // prendiamo la data del momento della prenotazione

    const record = [{ nome, telefono, persone, orario, giorno: OraLocale }];

    const csvWriter = createCsvWriter({
    path: 'prenotazioni.csv',
    header: [
        { id: 'nome', title: 'Nome' },
        { id: 'telefono', title: 'Telefono' },
        { id: 'persone', title: 'Persone' },
        { id: 'orario', title: 'Orario' },
        { id: 'giorno', title: 'Giorno' }
    ],
    append: fs.existsSync('prenotazioni.csv') // se esiste, aggiunge senza riscrivere
});

    csvWriter.writeRecords(record)
    .then(() => {
        console.log('CSV aggiornato!');
        res.json({ message: "Prenotazione salvata!" }); // <- qui
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Errore salvataggio CSV" });
    });
    });




app.get("/prenotazioni", (req, res) => {
    if (!fs.existsSync("prenotazioni.csv")) {
        return res.send("<h1>Nessuna prenotazione</h1>");
    }

    const data = fs.readFileSync("prenotazioni.csv", "utf8");
    const righe = data.split("\n").filter(r => r); // rimuove righe vuote

    let html = `
        <html>
        <head>
            <title>Prenotazioni Pizzeria</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { font-size: 28px; color: darkorange; }
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

    righe.slice(1).forEach(riga => { // salta la prima riga (header CSV)
        const [nome, telefono, persone, orario, giorno] = riga.split(",");
        html += `
            <tr>
                <td>${nome}</td>
                <td>${telefono}</td>
                <td>${persone}</td>
                <td>${orario}</td>
                <td>${giorno}</td>
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


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/cancella", (req, res) => {
    if (fs.existsSync("prenotazioni.csv")) {
        fs.unlinkSync("prenotazioni.csv");
        return res.send("<h1>Tutte le prenotazioni sono state cancellate!</h1>");
    }
    res.send("<h1>Nessun file da cancellare</h1>");
});

app.listen(3000, () => {
    console.log("Server in ascolto su http://localhost:3000");
});
