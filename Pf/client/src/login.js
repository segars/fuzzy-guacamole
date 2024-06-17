import React, { useState } from 'react';
import Axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Asegúrate de importar tu archivo CSS
import logo from './assets/Logos.png';

function Login({ setLoggedIn, setUserId, setUsername }) {
  const [username, setUsernameState] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState(false);

  const handleLogin = () => {
    if (!username || !password) {
      setWarning(true);
      return;
    }
    setWarning(false);

    Axios.post("http://localhost:3001/login", {
      username,
      password
    })
    .then(response => {
      alert("Login exitoso");
      setLoggedIn(true);
      setUserId(response.data.userId);
      setUsername(response.data.username);
    })
    .catch(error => {
      setError("Error al iniciar sesión: " + error.message);
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="left">
          <img src={logo} alt="Logo" />
          <h1>Bienvenidos a Inventarios-SCZ</h1>
          <p>Gestiona y organiza tus inventarios de manera fácil y eficiente con nuestra plataforma.</p>
        </div>
        <div className="right">
          <h2>Sign In</h2>
          <div className="input-group mb-3">
            <span className="input-group-text">Usuario</span>
            <input
              type="text"
              onChange={(event) => setUsernameState(event.target.value)}
              className="form-control"
              value={username}
              placeholder="Ingrese su usuario o correo electrónico"
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text">Contraseña</span>
            <input
              type="password"
              onChange={(event) => setPassword(event.target.value)}
              className="form-control"
              value={password}
              placeholder="Ingrese su contraseña"
            />
          </div>
          {warning && <p className="text-danger">Por favor, complete todos los campos.</p>}
          {error && <p className="text-danger">{error}</p>}
          <button className="btn btn-info mb-3" onClick={handleLogin}>Iniciar Sesión</button>
          <div className="text-center">
            <p>¿No tienes una cuenta? <a href="/register">Registrarse</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
