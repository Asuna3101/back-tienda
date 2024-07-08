const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer"); // Add this line to import nodemailer module
//import jwt from 'jsonwebtoken';
//import fs from 'fs';

const {usuario} = require ('./models/User.js');


const app = express();
const PORT = 4000;
const SECRET_KEY = 'your_secret_key';  // Utiliza una variable de entorno en producción

app.use(
    cors({
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Origin",
        "X-Requested-With",
        "Accept",
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Methods",
        "Access-Control-Allow-Credentials",
        "Access-Control-Allow-Private-Network",
        "jwt-token",
        "resettoken",
      ],
    })
  );
app.use(express.json());

app.post("/login", async (req, resp) => {
    const { correo, password } = req.body;
    let errors = [];

    if (!correo) errors.push("Debe haber un Correo");
    if (!password) errors.push("Debe haber una Contraseña");

    if (errors.length > 0) {
        resp.status(400).send({ error: errors.join(", ") });
        return;
    }

    try {
        const existingUser = await usuario.findOne({ where: { correo: correo } });
        if (!existingUser) {
            resp.status(404).send({ error: "Usuario no encontrado." });
            return;
        }

        // Comparacion de contrasenas
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (isMatch) {
            resp.send({ message: "Login con éxito." });
        } else {
            resp.status(401).send({ error: "Contraseña incorrecta." });
        }
    } catch (error) {
        resp.status(500).send({ error: `Error en el servidor: ${error.message}` });
    }
});
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
    //if (!id) errors.push("Debe haber un Usuario_ID");
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
    let hashedPassword;
    const salt=await bcrypt.genSalt()
    hashedPassword=await bcrypt.hash(password, salt)
    try {
        await usuario.create({ nombre, apellido, correo, password:hashedPassword});
        resp.send("Usuario registrado con éxito");
    } catch (error) {
        resp.send({ error: `Error: ${error}` });
    }
});





// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
