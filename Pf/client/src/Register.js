import React, { useState } from 'react';
import Axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function Register({ setLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = () => {
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    Axios.post("http://localhost:3001/register", {
      username,
      password,
      fullName,
      email,
      phone,
      company
    })
    .then(response => {
      alert("Registro exitoso");
      setLoggedIn(false);
      setUsername("");
      setPassword("");
      setFullName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setConfirmPassword("");
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
            <span className="input-group-text" id="basic-addon1">Nombre Completo</span>
            <input
              type="text"
              onChange={(event) => setFullName(event.target.value)}
              className="form-control" value={fullName}
              placeholder="Ingrese su nombre completo"
              aria-label="FullName"
              aria-describedby="basic-addon1"
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Correo Electrónico</span>
            <input
              type="email"
              onChange={(event) => setEmail(event.target.value)}
              className="form-control" value={email}
              placeholder="Ingrese su correo electrónico"
              aria-label="Email"
              aria-describedby="basic-addon1"
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Teléfono</span>
            <input
              type="tel"
              onChange={(event) => setPhone(event.target.value)}
              className="form-control" value={phone}
              placeholder="Ingrese su número de teléfono"
              aria-label="Phone"
              aria-describedby="basic-addon1"
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Empresa</span>
            <input
              type="text"
              onChange={(event) => setCompany(event.target.value)}
              className="form-control" value={company}
              placeholder="Ingrese el nombre de su empresa"
              aria-label="Company"
              aria-describedby="basic-addon1"
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Usuario</span>
            <input
              type="text"
              onChange={(event) => setUsername(event.target.value)}
              className="form-control" value={username}
              placeholder="Ingrese su usuario"
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
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Confirmar Contraseña</span>
            <input
              type="password"
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="form-control" value={confirmPassword}
              placeholder="Confirme su contraseña"
              aria-label="ConfirmPassword"
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
