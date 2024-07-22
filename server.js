const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Fungsi untuk membuat ID acak pendek (5 karakter)
const generateShortId = () => {
    return Math.random().toString(36).substr(2, 5); // Menghasilkan string acak sepanjang 5 karakter
};

// Fungsi untuk men-escape karakter HTML
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// Penyimpanan sementara dalam memori
const tempStorage = {};

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/api/save', (req, res) => {
    const text = req.body.text;
    const id = generateShortId();

    // Simpan teks ke penyimpanan sementara
    tempStorage[id] = text;
    res.json({ url: `https://0xnote.vercel.app/view/${id}` });
});

app.get('/view/:id', (req, res) => {
    const id = req.params.id;

    if (tempStorage[id]) {
        let text = tempStorage[id];
        text = escapeHtml(text);
        const title = `view ${id}.txt`; // Menampilkan judul dengan format "view {id}.txt"
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
            </head>
            <body class="bg-gray-100">
                <div class="container mx-auto mt-10">
                    <div class="bg-white p-6 rounded-lg shadow-lg">
                        <pre class="whitespace-pre-wrap p-4 bg-gray-100 rounded-lg">${text}</pre>
                    </div>
                </div>
            </body>
            </html>
        `);
    } else {
        res.status(404).send('Not found');
    }
});

app.get('/raw/:id', (req, res) => {
    const id = req.params.id;

    if (tempStorage[id]) {
        res.send(tempStorage[id]);
    } else {
        res.status(404).send('Not found');
    }
});

// Route untuk halaman about
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// Route untuk halaman contact
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// Ekspor aplikasi untuk Vercel
module.exports = app;
