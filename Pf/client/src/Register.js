// Register.js
import React, { useState } from 'react';
import Axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function Register({ setLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = () => {
    Axios.post("http://localhost:3001/register", {
      username,
      password
    })
    .then(response => {
      // Maneja el registro exitoso
      alert("Registro exitoso");
      setLoggedIn(true); // Cambia el estado de loggedIn en App.js
    })
    .catch(error => {
      setError("Error al registrar: " + error.message);
    });
  };

  return (
    <div className="container">
      <div className="card text-center">
        <div className="card-header">
          REGISTRO
        </div>
        <div className="card-body">
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Usuario</span>
            <input
              type="text"
              onChange={(event) => setUsername(event.target.value)}
              className="form-control" value={username}
              placeholder="Ingrese su usuario"
              aria-label="Usuario"
              aria-describedby="basic-addon1"
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Contraseña</span>
            <input
              type="password"
              onChange={(event) => setPassword(event.target.value)}
              className="form-control" value={password}
              placeholder="Ingrese su contraseña"
              aria-label="Contraseña"
              aria-describedby="basic-addon1"
            />
          </div>
          {error && <p className="text-danger">{error}</p>}
        </div>
        <div className="card-footer text-body-secondary">
          <button className='btn btn-info' onClick={handleRegister}>Registrarse</button>
        </div>
      </div>
    </div>
  );
}

export default Register;
