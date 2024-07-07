import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const app = express();
const PORT = 4000;
const SECRET_KEY = 'your_secret_key';  // Utiliza una variable de entorno en producción

app.use(cors());
app.use(express.json());

// Endpoint de login
app.post('/login', (req, res) => {
    const { correo, password } = req.body;
    if (correo === "test@example.com" && password === "password") {
        // Generar token
        const token = jwt.sign({ email: correo }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: "Login successful", token });
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
});

// Endpoint para registrar un usuario
app.post('/register', (req, res) => {
    const { nombre, apellido, correo, password } = req.body;
    console.log(`Registrando usuario: ${nombre} ${apellido} ${correo}`);
    // Añadir lógica para guardar estos datos en tu base de datos
    res.status(201).json({
        message: "Usuario registrado exitosamente",
        userData: req.body
    });
});

// Endpoint para recuperación de contraseña
app.post('/password/recovery', (req, res) => {
    const { correo } = req.body;
    console.log(`Recovery request for: ${correo}`);
    res.json({ message: 'Recovery email sent if the account exists' });
});

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;
    if (!token) {
        return res.status(403).send({ message: "No token provided" });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(500).send({ message: "Failed to authenticate token" });
        }
        req.user = decoded;
        next();
    });
};

// Ruta protegida para el perfil del usuario
app.get('/api/user/profile', verifyToken, (req, res) => {
    const userProfile = {
        name: 'test',
        email: req.user.email
    };
    res.json(userProfile);
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

app.post('/api/user/change-password', verifyToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const email = req.user.email;  // Asumiendo que el email está en el token

    // Aquí debes leer tus datos de usuario, por ejemplo de un archivo JSON
    const users = await fs.readJson('./users.json');
    const user = users.find(user => user.correo === email);

    if (!user || user.password !== oldPassword) {
        return res.status(401).json({ message: "La contraseña actual es incorrecta" });
    }

    user.password = newPassword;  // Actualiza la contraseña

    // Guardar el usuario actualizado
    const index = users.findIndex(u => u.correo === email);
    users[index] = user;
    await fs.writeJson('./users.json', users);

    res.json({ message: "La contraseña ha sido actualizada correctamente" });
});




// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
