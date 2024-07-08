const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer"); 

const jsonwebtoken = require("jsonwebtoken");

const { usuario, sequelize } = require("./models/User.js");

const app = express();
const PORT = 4000;
const SECRET_KEY = "12345"; // Utiliza una variable de entorno en producción
const REFRESH_TOKEN = "123456789"; // Utiliza una variable de entorno en producción

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

// Login
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
      // Generar token
      const token = jsonwebtoken.sign(
        { id: existingUser.id, correo: existingUser.correo },
        SECRET_KEY,
        {
          expiresIn: "20h",
        }
      );

      resp.status(200).send({ token });
    } else {
      resp.status(401).send({ error: "Contraseña incorrecta." });
    }
  } catch (error) {
    resp.status(500).send({ error: `Error en el servidor: ${error.message} `});
  }
});

// Get user
app.get("/usuario", async (req, resp) => {
  const authToken = req.headers["authorization"];

  const token = authToken.split(" ")[1];

  const { id } = jsonwebtoken.verify(token, SECRET_KEY);

  const getUser = await usuario.findOne({
    where: { id },
  });

  resp.status(200).send(getUser.dataValues);
});

// Create user
app.post("/usuarios", async (req, resp) => {
  const { nombre, apellido, correo, password } = req.body;
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
  const salt = await bcrypt.genSalt();
  hashedPassword = await bcrypt.hash(password, salt);
  try {
    await usuario.create({
      nombre,
      apellido,
      correo,
      password: hashedPassword,
    });
    resp.send("Usuario registrado con éxito");
  } catch (error) {
    resp.send({ error: `Error: ${error} `});
  }
});

// Update user
app.put("/usuario", async (req, resp) => {
  const authToken = req.headers["authorization"];

  const token = authToken.split(" ")[1];
  const { nombre, apellido, correo } = req.body;

  const { id } = jsonwebtoken.verify(token, SECRET_KEY);

  const getUser = await usuario.findOne({
    where: {
      correo,
    },
  });

  if (getUser && getUser.dataValues.id !== id) {
    resp.status(400).send({ error: "Correo ya registrado." });
    return;
  }

  await usuario.update(
    {
      nombre,
      apellido,
      correo,
    },
    {
      where: { id },
    }
  );

  resp.status(200).send({ ok: true });
});

//Change password
app.put("/change-password", async (req, res) => {
  const authToken = req.headers["authorization"];

  const token = authToken.split(" ")[1];
  const { oldPassword, newPassword } = req.body;

  const { id } = jsonwebtoken.verify(token, SECRET_KEY);

  const userData = await usuario.findOne({
    where: { id },
  });

  const isPasswordCorrect = await bcrypt.compare(
    oldPassword,
    userData.password
  );

  if (!isPasswordCorrect) {
    return res.status(500).send({ message: "Password do not match" });
  }

  const salt = await bcrypt.genSalt();

  const hashedPassword = await bcrypt.hash(newPassword, salt);

  userData.password = hashedPassword;

  await userData.save();

  res.status(200).send({ ok: true });
});

app.post("/forgot-password", async (req, res) => {
  const { correo } = req.body;

  const userData = await usuario.findOne({
    where: { correo },
  });

  if (!userData) {
    return res.status(404).send({ message: "User not found" });
  }

  const refresh_token = jsonwebtoken.sign(
    { id: userData.id, correo: userData.correo },
    REFRESH_TOKEN,
    {
      expiresIn: "20h",
    }
  );
  console.log(refresh_token);
  userData.recovery_password = refresh_token;

  await userData.save();

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "andreaximena2004@gmail.com",
      pass: "kcrnmgspvcuewbbb",
    },
  });

  const mailOptions = {
    from: "andreaximena2004@gmail.com",
    to: userData.correo,
    subject: "Recuperación de contraseña",
    text: `Ingrese al siguiente enlace para cambiar su contraseña: http://localhost:3000/reset-password?token=${refresh_token}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
});

app.put("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  console.log(req.body);

  const userData = await usuario.findOne({
    where: { recovery_password: token },
  });

  if (!userData) {
    return res.status(404).send({ message: "User not found" });
  }

  const salt = await bcrypt.genSalt();

  const hashedPassword = await bcrypt.hash(newPassword, salt);

  userData.password = hashedPassword;
  userData.recovery_password = null;

  await userData.save();

  res.status(200).send({ ok: true });
});

// Iniciar el servidor
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  await sequelize.sync({ force: false });
});