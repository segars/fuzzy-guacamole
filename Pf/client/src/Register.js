import React, { useState } from 'react';
import Axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import zxcvbn from 'zxcvbn';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import logo from './assets/Logos.png';

function Register({ setLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [invitationCode, setInvitationCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleRegister = () => {
    if (!username || !password || !fullName || !email || !phone || !company || !confirmPassword) {
      setWarning(true);
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!email.endsWith("@gmail.com")) {
      setError("El correo electrónico debe terminar en @gmail.com");
      return;
    }

    Axios.post("http://localhost:3001/register", {
      username,
      password,
      fullName,
      email,
      phone,
      company,
      role,
      invitationCode
    })
    .then(response => {
      alert("Registro exitoso, por favor verifica tu correo");
      setIsVerifying(true);
    })
    .catch(error => {
      setError("Error al registrar: " + (error.response?.data?.message || error.message));
    });
  };

  const handleVerify = () => {
    if (!verificationCode) {
      setError("Por favor ingrese el código de verificación");
      return;
    }

    Axios.post("http://localhost:3001/verify", {
      email,
      verificationCode
    })
    .then(response => {
      alert("Cuenta verificada exitosamente");
      setLoggedIn(true);
      window.location.href = '/';
    })
    .catch(error => {
      setError("Error al verificar: " + (error.response?.data?.message || error.message));
    });
  };

  const handlePasswordChange = (event) => {
    const passwordValue = event.target.value;
    setPassword(passwordValue);
    const evaluation = zxcvbn(passwordValue);
    setPasswordStrength(evaluation.score);
  };

  const getPasswordStrengthLabel = (score) => {
    switch (score) {
      case 0:
        return "Muy débil";
      case 1:
        return "Débil";
      case 2:
        return "Aceptable";
      case 3:
        return "Buena";
      case 4:
        return "Fuerte";
      default:
        return "";
    }
  };

  const getPasswordStrengthColor = (score) => {
    switch (score) {
      case 0:
        return "#dc3545";
      case 1:
        return "#ffc107";
      case 2:
        return "#fd7e14";
      case 3:
        return "#20c997";
      case 4:
        return "#28a745";
      default:
        return "";
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="left">
          <img src={logo} alt="Logo" />
          <h1>Bienvenido al Registro</h1>
          <p>Regístrate para empezar a gestionar tus inventarios con nuestra plataforma.</p>
        </div>
        <div className="right">
          <h2>Register</h2>
          {!isVerifying ? (
            <>
              <div className="input-group mb-4">
                <span className="input-group-text">Nombre Completo</span>
                <input
                  type="text"
                  onChange={(event) => setFullName(event.target.value)}
                  className="form-control"
                  value={fullName}
                  placeholder="Ingrese su nombre completo"
                />
              </div>
              <div className="input-group mb-4">
                <span className="input-group-text">Correo Electrónico</span>
                <input
                  type="email"
                  onChange={(event) => setEmail(event.target.value)}
                  className="form-control"
                  value={email}
                  placeholder="Ingrese su correo electrónico"
                />
              </div>
              <div className="input-group mb-4 d-flex">
                <span className="input-group-text">Teléfono</span>
                <div className="flex-grow-1">
                  <PhoneInput
                    country={'us'}
                    value={phone}
                    onChange={(phone) => setPhone(phone)}
                    inputClass="form-control w-100"
                  />
                </div>
              </div>
              <div className="input-group mb-4">
                <span className="input-group-text">Empresa</span>
                <input
                  type="text"
                  onChange={(event) => setCompany(event.target.value)}
                  className="form-control"
                  value={company}
                  placeholder="Ingrese el nombre de su empresa"
                />
              </div>
              <div className="input-group mb-4">
                <span className="input-group-text">Usuario</span>
                <input
                  type="text"
                  onChange={(event) => setUsername(event.target.value)}
                  className="form-control"
                  value={username}
                  placeholder="Ingrese su usuario"
                />
              </div>
              <div className="input-group mb-4">
                <span className="input-group-text">Contraseña</span>
                <input
                  type="password"
                  onChange={handlePasswordChange}
                  className="form-control"
                  value={password}
                  placeholder="Ingrese su contraseña"
                />
              </div>
              <div className="password-strength-bar-container">
                <div className="password-strength-bar" style={{ backgroundColor: getPasswordStrengthColor(passwordStrength), width: `${(passwordStrength + 1) * 20}%` }}></div>
              </div>
              <div className="password-strength">
                Fuerza de la contraseña: {getPasswordStrengthLabel(passwordStrength)}
              </div>
              <div className="input-group mb-4">
                <span className="input-group-text">Confirmar Contraseña</span>
                <input
                  type="password"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="form-control"
                  value={confirmPassword}
                  placeholder="Confirme su contraseña"
                />
              </div>
              <div className="input-group mb-4">
                <span className="input-group-text">Rol</span>
                <select
                  onChange={(event) => setRole(event.target.value)}
                  className="form-control"
                  value={role}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              {role === "user" && (
                <div className="input-group mb-4">
                  <span className="input-group-text">Código de Invitación</span>
                  <input
                    type="text"
                    onChange={(event) => setInvitationCode(event.target.value)}
                    className="form-control"
                    value={invitationCode}
                    placeholder="Ingrese el código de invitación (solo empleados)"
                  />
                </div>
              )}
              {warning && <p className="text-danger">Por favor, complete todos los campos.</p>}
              {error && <p className="text-danger">{error}</p>}
              <button className="btn btn-info mb-3" onClick={handleRegister}>Registrarse</button>
            </>
          ) : (
            <>
              <div className="input-group mb-4">
                <span className="input-group-text">Código de Verificación</span>
                <input
                  type="text"
                  onChange={(event) => setVerificationCode(event.target.value)}
                  className="form-control"
                  value={verificationCode}
                  placeholder="Ingrese el código de verificación enviado a su correo"
                />
              </div>
              {error && <p className="text-danger">{error}</p>}
              <button className="btn btn-info mb-3" onClick={handleVerify}>Verificar</button>
            </>
          )}
          <div className="text-center">
            <p>¿Ya tienes una cuenta? <a href="/">Inicia Sesión</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
