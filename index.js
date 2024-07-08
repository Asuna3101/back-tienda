const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")

//import jwt from 'jsonwebtoken';
//import fs from 'fs';

const {usuario} = require ('./models/User.js');
const app = express();
const PORT = 4000;
const SECRET_KEY = 'your_secret_key';  // Utiliza una variable de entorno en producción

app.use(cors());
app.use(express.json());

// Endpoint de login

//
app.get("/usuarios", async (req, resp) => {
    const Usuarios = req.query.id
    if (Usuarios == undefined) {
        const listausuarios = await usuario.findAll()
        resp.send(listausuarios)
    } else {
        const listausuarios = await usuario.findAll({
            where: {
                id: Usuarios
            }
        })
        resp.send(listausuarios)
    }
})

app.post("/usuarios", async (req, resp) => {
    const { id, nombre, apellido, correo, password } = req.body;
    let errors = [];
    if (!id) errors.push("Debe haber un Usuario_ID");
    if (!nombre) errors.push("Debe haber un Nombre");
    if (!apellido) errors.push("Debe haber un Apellido");
    if (!correo) errors.push("Debe haber un Correo");
    if (!password) errors.push("Debe haber una Contraseña");

    if (errors.length > 0) {
        resp.send({ error: errors.join(", ") });
        return;
    }

    const existingUser = await usuario.findAll({ where: { correo: correo } });
    if (existingUser.length > 0) {
        resp.send({ error: "ERROR. Ya existe un usuario con ese correo." });
        return;
    }

    try {
        await usuario.create({ id, nombre, apellido, correo, password });
        resp.send("Usuario registrado con éxito");
    } catch (error) {
        resp.send({ error: `Error: ${error}` });
    }
});




// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
