const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mysql = require('mysql2/promise');
const Queue = require('bee-queue');

const app = express();
app.use(express.json());

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sorteocasos',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const SESSIONS = {}; 


async function startWhatsAppSession(sessionName) {
    const client = new Client({
        authStrategy: new LocalAuth({ clientId: sessionName })
    });

    client.on('qr', (qr) => {
        console.log(`🔄 Escanea este QR para la sesión: ${sessionName}`);
        qrcode.generate(qr, { small: true });
    });

    client.on('authenticated', async (session) => {
        console.log(`✅ Sesión "${sessionName}" autenticada.`);
        const connection = await db.getConnection();
        await connection.query(`
            INSERT INTO whatsapp_sessions (phone_number, session_data) 
            VALUES (?, ?) ON DUPLICATE KEY UPDATE session_data = ?
        `, [sessionName, JSON.stringify(session), JSON.stringify(session)]);
        connection.release();
    });

    client.on('ready', () => {
        console.log(`🚀 Sesión "${sessionName}" lista para enviar mensajes.`);
        SESSIONS[sessionName] = client; 
    });

    client.on('disconnected', async () => {
        console.log(`❌ Sesión "${sessionName}" cerrada. Escanea el QR para reabrir.`);
        delete SESSIONS[sessionName];
    });

    client.initialize();
}


const SESSION_NAMES = ["session1", "session2", "session3"];
SESSION_NAMES.forEach(startWhatsAppSession);


const messageQueue = new Queue('messageQueue', {
    isWorker: true,  
    storeJobs: false, 
    activateDelayedJobs: true, 
    removeOnSuccess: true,
    removeOnFailure: true
});



messageQueue.process(async (job) => {
    const { phone, message } = job.data;

    
    const availableSessions = Object.values(SESSIONS);
    if (availableSessions.length === 0) {
        console.error("⚠️ No hay sesiones activas, el mensaje no se enviará.");
        return { success: false, error: "No hay sesiones activas." };
    }

    const sessionToUse = availableSessions[Math.floor(Math.random() * availableSessions.length)];

    try {
        console.log(`📤 Enviando mensaje a ${phone} usando ${sessionToUse.options.authStrategy.clientId}...`);

       
        const delay = Math.floor(Math.random() * (6000 - 4000 + 1)) + 4000;
        await new Promise(resolve => setTimeout(resolve, delay));

        await sessionToUse.sendMessage(`${phone}@c.us`, message);
        console.log(`✅ Mensaje enviado a ${phone} con éxito.`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Error al enviar mensaje a ${phone}:`, error);
        throw error;
    }
});


app.post('/send-message', async (req,  ) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ error: 'Número de teléfono y mensaje son requeridos.' });
    }

    try {
        await messageQueue.createJob({ phone, message }).save();
        res.json({ success: true, message: 'Mensaje encolado correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al encolar el mensaje', details: error });
    }
});


app.get('/session-status', (req, res) => {
    const activeSessions = Object.keys(SESSIONS);
    res.json({ active_sessions: activeSessions });
});


app.get('/queue-status', async (req, res) => {
    const jobs = await messageQueue.getJobs(['delayed', 'waiting', 'active']);
    res.json({ queue_length: jobs.length });
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
