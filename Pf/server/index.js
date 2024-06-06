//index

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
    const username = req.body.username;
    const password = req.body.password;
  
    db.query(
      'INSERT INTO user (username, password) VALUES (?, ?)',
      [username, password],
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

  db.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.length > 0) {
      res.send({ message: "Login successful" });
    } else {
      res.status(401).send({ message: "Invalid credentials" });
    }
  });
});

app.post("/create", (req, res) => {
  const { Producto, Fecha, Caducidad, Cantidad, Costo } = req.body;

  db.query('INSERT INTO producto (Producto, Fecha, Caducidad, Cantidad, Costo) VALUES (?, ?, ?, ?, ?)', 
    [Producto, Fecha, Caducidad, Cantidad, Costo], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        res.send({ id: result.insertId, message: "Producto registrado con éxito" });
      }
    }
  );
});

app.get("/productos", (req, res) => {
  db.query('SELECT * FROM producto', (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.send(result);
    }
  });
});

app.put("/update", (req, res) => {
  const { id, Producto, Fecha, Caducidad, Cantidad, Costo } = req.body;

  db.query('UPDATE producto SET Producto = ?, Fecha = ?, Caducidad = ?, Cantidad = ?, Costo = ? WHERE id = ?', 
    [Producto, Fecha, Caducidad, Cantidad, Costo, id], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        res.send("Producto actualizado con éxito");
      }
    }
  );
});

app.delete("/delete/:id", (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM producto WHERE id = ?', [id], (err, result) => {
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
