import React, { useState } from 'react';
import Axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

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
      // Maneja el login exitoso
      alert("Login exitoso");
      setLoggedIn(true);
      setUserId(response.data.userId); // Asegúrate de que el backend envía el userId
      setUsername(response.data.username); // Asegúrate de que el backend envía el username
    })
    .catch(error => {
      setError("Error al iniciar sesión: " + error.message);
    });
  };

  return (
    <div className="container">
      <div className="card text-center">
        <div className="card-header">
          INICIO DE SESIÓN
        </div>
        <div className="card-body">
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Usuario o Correo Electrónico</span>
            <input
              type="text"
              onChange={(event) => setUsernameState(event.target.value)}
              className="form-control" value={username}
              placeholder="Ingrese su usuario o correo electrónico"
              aria-label="Username"
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
              aria-label="Password"
              aria-describedby="basic-addon1"
            />
          </div>
          {warning && <p className="text-danger">Por favor, complete todos los campos.</p>}
          {error && <p className="text-danger">{error}</p>}
        </div>
        <div className="card-footer text-body-secondary">
          <button className='btn btn-info' onClick={handleLogin}>Iniciar Sesión</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
