const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require('dotenv').config();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "sebas123",
  database: process.env.DB_NAME || "productos"
});

db.connect((err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.message);
    process.exit(1);
  } else {
    console.log("Conectado a la base de datos MySQL");
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/register', (req, res) => {
  const { username, password, fullName, email, phone, company, role, invitationCode } = req.body;

  if (role === 'admin') {
    db.query('SELECT * FROM user WHERE company = ? AND role = "admin"', [company], (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      if (result.length > 0) {
        return res.status(400).send({ message: 'Ya existe un administrador para esta empresa' });
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000);

      db.query(
        'INSERT INTO user (username, password, fullName, email, phone, company, role, verificationCode, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [username, password, fullName, email, phone, company, role, verificationCode, 0],
        (err, result) => {
          if (err) {
            console.error("Error al insertar en la base de datos:", err);
            return res.status(500).send({ error: err.message });
          }

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Código de Verificación',
            text: `Tu código de verificación es: ${verificationCode}`
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error al enviar el correo de verificación:", error);
              return res.status(500).send({ error: 'Error al enviar el correo de verificación' });
            }
            res.send({ message: 'Administrador registrado exitosamente, por favor verifica tu correo' });
          });
        }
      );
    });
  } else {
    db.query('SELECT * FROM employees WHERE company = ? AND accessKey = ? AND used = FALSE', [company, invitationCode], (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      if (result.length === 0) {
        return res.status(401).send({ message: 'Código de invitación inválido o ya usado' });
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000);

      db.query(
        'INSERT INTO user (username, password, fullName, email, phone, company, role, verificationCode, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [username, password, fullName, email, phone, company, role, verificationCode, 0],
        (err, result) => {
          if (err) {
            console.error("Error al insertar en la base de datos:", err);
            return res.status(500).send({ error: err.message });
          }

          db.query('UPDATE employees SET used = TRUE WHERE company = ? AND accessKey = ?', [company, invitationCode], (err, result) => {
            if (err) {
              console.error("Error al actualizar el código de invitación:", err);
            }
          });

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Código de Verificación',
            text: `Tu código de verificación es: ${verificationCode}`
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error al enviar el correo de verificación:", error);
              return res.status(500).send({ error: 'Error al enviar el correo de verificación' });
            }
            res.send({ message: 'Empleado registrado exitosamente, por favor verifica tu correo' });
          });
        }
      );
    });
  }
});

app.post('/send-employee-invitation', (req, res) => {
  const { email, company } = req.body;
  const accessKey = crypto.randomBytes(20).toString('hex');

  db.query(
    'INSERT INTO employees (employeeEmail, company, accessKey) VALUES (?, ?, ?)',
    [email, company, accessKey],
    (err, result) => {
      if (err) {
        console.error("Error al insertar código de invitación en la base de datos:", err);
        return res.status(500).send({ error: err.message });
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Código de Invitación',
        text: `Tu código de invitación es: ${accessKey}`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error al enviar el correo de invitación:", error);
          return res.status(500).send({ error: 'Error al enviar el correo de invitación' });
        }
        res.send({ message: 'Código de invitación enviado exitosamente' });
      });
    }
  );
});

app.post('/verify', (req, res) => {
  const { email, verificationCode } = req.body;

  db.query('SELECT * FROM user WHERE email = ? AND verificationCode = ?', [email, verificationCode], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.length > 0) {
      db.query('UPDATE user SET verified = 1 WHERE email = ?', [email], (err, result) => {
        if (err) {
          return res.status(500).send(err);
        }
        res.send({ message: 'Cuenta verificada exitosamente' });
      });
    } else {
      res.status(401).send({ message: 'Código de verificación incorrecto' });
    }
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM user WHERE (username = ? OR email = ?) AND password = ?', [username, username, password], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.length > 0) {
      const user = result[0];
      if (!user.verified) {
        return res.status(401).send({ message: "Por favor verifica tu cuenta antes de iniciar sesión" });
      }
      res.send({ message: "Login successful", userId: user.id, username: user.username, role: user.role, company: user.company });
    } else {
      res.status(401).send({ message: "Invalid credentials" });
    }
  });
});

app.post("/create", (req, res) => {
  const { Producto, Fecha, Caducidad, Cantidad, Costo, userId, company } = req.body;

  if (!Producto || !Fecha || !Caducidad || !Cantidad || !Costo || !userId || !company) {
    return res.status(400).send({ error: "Todos los campos son obligatorios" });
  }

  db.query('INSERT INTO producto (Producto, Fecha, Caducidad, Cantidad, Costo, userId, company) VALUES (?, ?, ?, ?, ?, ?, ?)', 
    [Producto, Fecha, Caducidad, Cantidad, Costo, userId, company], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        res.send({ id: result.insertId, message: "Producto registrado con éxito" });
      }
    }
  );
});

app.get("/productos/:company", (req, res) => {
  const { company } = req.params;

  db.query('SELECT * FROM producto WHERE company = ?', [company], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.send(result);
    }
  });
});

app.put("/update", (req, res) => {
  const { id, Producto, Fecha, Caducidad, Cantidad, Costo, userId, company } = req.body;

  db.query('UPDATE producto SET Producto = ?, Fecha = ?, Caducidad = ?, Cantidad = ?, Costo = ? WHERE id = ? AND userId = ? AND company = ?', 
    [Producto, Fecha, Caducidad, Cantidad, Costo, id, userId, company], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        res.send("Producto actualizado con éxito");
      }
    }
  );
});

app.delete("/delete/:id/:userId/:company", (req, res) => {
  const { id, userId, company } = req.params;

  db.query('DELETE FROM producto WHERE id = ? AND userId = ? AND company = ?', [id, userId, company], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.send("Producto eliminado con éxito");
    }
  });
});

app.listen(3001, () => {
  console.log("Corriendo en el puerto 3001");
});
