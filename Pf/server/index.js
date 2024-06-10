const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "sebas123",
  database: "productos"
});

db.connect();

app.post('/register', (req, res) => {
  const { username, password, fullName, email, phone, company } = req.body;

  db.query(
    'INSERT INTO user (username, password, fullName, email, phone, company) VALUES (?, ?, ?, ?, ?, ?)',
    [username, password, fullName, email, phone, company],
    (err, result) => {
      if (err) {
        res.status(500).send({ error: err.message });
      } else {
        res.send({ message: 'Usuario registrado exitosamente' });
      }
    }
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM user WHERE (username = ? OR email = ?) AND password = ?', [username, username, password], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.length > 0) {
      const user = result[0];
      res.send({ message: "Login successful", userId: user.id, username: user.username });
    } else {
      res.status(401).send({ message: "Invalid credentials" });
    }
  });
});

app.post("/create", (req, res) => {
  const { Producto, Fecha, Caducidad, Cantidad, Costo, userId } = req.body;

  db.query('INSERT INTO producto (Producto, Fecha, Caducidad, Cantidad, Costo, userId) VALUES (?, ?, ?, ?, ?, ?)', 
    [Producto, Fecha, Caducidad, Cantidad, Costo, userId], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        res.send({ id: result.insertId, message: "Producto registrado con éxito" });
      }
    }
  );
});

app.get("/productos/:userId", (req, res) => {
  const { userId } = req.params;

  db.query('SELECT * FROM producto WHERE userId = ?', [userId], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.send(result);
    }
  });
});

app.put("/update", (req, res) => {
  const { id, Producto, Fecha, Caducidad, Cantidad, Costo, userId } = req.body;

  db.query('UPDATE producto SET Producto = ?, Fecha = ?, Caducidad = ?, Cantidad = ?, Costo = ? WHERE id = ? AND userId = ?', 
    [Producto, Fecha, Caducidad, Cantidad, Costo, id, userId], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        res.send("Producto actualizado con éxito");
      }
    }
  );
});

app.delete("/delete/:id/:userId", (req, res) => {
  const { id, userId } = req.params;

  db.query('DELETE FROM producto WHERE id = ? AND userId = ?', [id, userId], (err, result) => {
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
