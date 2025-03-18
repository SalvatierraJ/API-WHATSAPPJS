const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sorteocasos',
    port: 3306 
});


db.connect(err => {
    if (err) {
        console.error('Error al conectar a MySQL:', err);
        return;
    }
    console.log('Conectado a MySQL');
});

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS whatsapp_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone_number VARCHAR(20) UNIQUE NOT NULL,
        session_data JSON NOT NULL
    )
`;
db.query(createTableQuery, (err, result) => {
    if (err) {
        console.error('Error al crear la tabla:', err);
        return;
    }
    console.log('Tabla whatsapp_sessions verificada o creada exitosamente');
});
db.end();
