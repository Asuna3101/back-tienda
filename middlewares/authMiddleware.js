const jwt = require('jsonwebtoken');
const pool = require('../database/db');

// Middleware para proteger rutas
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtener el token de la cabecera
            token = req.headers.authorization.split(' ')[1];

            // Verificar el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Obtener información del usuario del token
            req.user = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [decoded.id]);
            req.user = req.user.rows[0];

            next();
        } catch (error) {
            res.status(401).json({ message: 'No autorizado, token fallido' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no hay token' });
    }
};

module.exports = { protect };
