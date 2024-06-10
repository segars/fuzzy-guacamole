import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import Axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import FontAwesome
import moment from 'moment';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Dropdown, Form, InputGroup, Button, Table, Navbar, Container, Nav } from 'react-bootstrap';
import Login from './login';
import Register from './Register';
import Dashboard from './Dashboard';

function App() {
  const [Producto, setProducto] = useState("");
  const [Fecha, setFecha] = useState("");
  const [Caducidad, setCaducidad] = useState("");
  const [Cantidad, setCantidad] = useState("");
  const [Costo, setCosto] = useState("");
  const [id, setId] = useState("");
  const [productosList, setProductos] = useState([]);
  const [editar, setEditar] = useState(false);
  const [advertencia, setAdvertencia] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [hoverMessages, setHoverMessages] = useState({});
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");

  const add = () => {
    if (!Producto || !Fecha || !Caducidad || !Cantidad || !Costo) {
      setAdvertencia(true);
      return;
    }
    setAdvertencia(false);

    Axios.post("http://localhost:3001/create", {
      Producto,
      Fecha,
      Caducidad,
      Cantidad,
      Costo,
      userId
    })
    .then((response) => {
      const newProduct = { id: response.data.id, Producto, Fecha, Caducidad, Cantidad, Costo };
      setProductos([...productosList, newProduct]);
      alert("Producto registrado");
      cancelar();
    })
    .catch(error => {
      alert("Error al registrar el producto: " + error.message);
    });
  }

  const update = () => {
    if (!Producto || !Fecha || !Caducidad || !Cantidad || !Costo) {
      setAdvertencia(true);
      return;
    }
    setAdvertencia(false);

    Axios.put("http://localhost:3001/update", {
      id,
      Producto,
      Fecha,
      Caducidad,
      Cantidad,
      Costo,
      userId
    })
    .then((response) => {
      const updatedProducts = productosList.map(product => {
        if (product.id === id) {
          return {
            id: product.id,
            Producto,
            Fecha,
            Caducidad,
            Cantidad,
            Costo
          };
        }
        return product;
      });
      setProductos(updatedProducts);
      alert("Producto actualizado");
      cancelar();
    })
    .catch(error => {
      alert("Error al actualizar el producto: " + error.message);
    });
  }

  const editarProducto = (val) => {
    setEditar(true);
    setDropdownOpen(true);

    setProducto(val.Producto);
    if (val.Fecha) {
      setFecha(val.Fecha);
    }
    if (val.Caducidad) {
      setCaducidad(val.Caducidad);
    }
    setCantidad(val.Cantidad);
    setCosto(val.Costo);
    setId(val.id);
  }

  const cancelar = () => {
    setProducto("");
    setFecha("");
    setCaducidad("");
    setCantidad("");
    setCosto("");
    setId("");
    setEditar(false);
    setDropdownOpen(false);
  }

  const eliminarProducto = (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      Axios.delete(`http://localhost:3001/delete/${id}/${userId}`)
      .then(() => {
        setProductos(productosList.filter(product => product.id !== id));
        alert("Producto eliminado");
      })
      .catch(error => {
        alert("Error al eliminar el producto: " + error.message);
      });
    }
  }

  const getProductos = useCallback(() => {
    if (userId) {
      Axios.get(`http://localhost:3001/productos/${userId}`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          const validProducts = response.data.map(product => ({
            ...product,
            Costo: product.Costo?.data ? new TextDecoder().decode(new Uint8Array(product.Costo.data)) : product.Costo
          }));
          setProductos(validProducts);
        } else {
          console.error("Los datos recibidos no son un array:", response.data);
        }
      })
      .catch(error => {
        alert("Error al obtener los productos: " + error.message);
      });
    }
  }, [userId]);

  const formattedFecha = (fecha) => {
    return moment(fecha).format('YYYY-MM-DD');
  };

  const productosFiltrados = productosList.filter(producto =>
    producto.Producto.toLowerCase().includes(filtro.toLowerCase())
  );

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUsername = localStorage.getItem("username");
    if (storedUserId) {
      setUserId(storedUserId);
      setUsername(storedUsername);
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      getProductos();
    }
  }, [userId, getProductos]);

  const logout = () => {
    if (window.confirm("¿Estás seguro de que deseas salir?")) {
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      setLoggedIn(false);
      setUserId(null);
      setUsername("");
      window.location.href = '/Login';
    }
  }

  const handleMouseEnter = (producto) => {
    const currentDate = moment();
    const expirationDate = moment(producto.Caducidad);

    let message = "";
    if (currentDate.isAfter(expirationDate)) {
      message += "El producto ya venció";
    }
    if (producto.Cantidad <= 5) {
      if (message) {
        message += " y ";
      }
      message += "se está acabando";
    }

    setHoverMessages((prev) => ({
      ...prev,
      [producto.id]: message,
    }));
  }

  const handleMouseLeave = (producto) => {
    setHoverMessages((prev) => ({
      ...prev,
      [producto.id]: "",
    }));
  }

  if (!loggedIn) {
    return (
      <div className="container">
        <div className="d-flex justify-content-center mb-3">
          <Button variant="primary" onClick={() => setIsRegister(false)}>
            Iniciar Sesión
          </Button>
          <Button variant="secondary" onClick={() => setIsRegister(true)}>
            Registrarse
          </Button>
        </div>
        {isRegister ? <Register setLoggedIn={setLoggedIn} /> : <Login setLoggedIn={setLoggedIn} setUserId={(userId) => { setUserId(userId); localStorage.setItem("userId", userId); }} setUsername={(username) => { setUsername(username); localStorage.setItem("username", username); }} getProductos={getProductos} />}  
      </div>
    );
  }

  return (
    <Router>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">Inventario</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/">Productos</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link href="#">Bienvenido, {username}</Nav.Link>
              <Nav.Link onClick={logout}>Cerrar Sesión</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        <Route path="/dashboard" element={<Dashboard productosList={productosList} />} />
        <Route path="/" element={
          <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Gestionar Productos</h2>
              <Button variant="primary" onClick={() => setDropdownOpen(!dropdownOpen)}>Registrar un producto</Button>
            </div>

            <InputGroup className="mb-4">
              <Form.Control
                type="text"
                placeholder="Buscar por nombre de producto"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </InputGroup>

            <Dropdown show={dropdownOpen}>
              <Dropdown.Menu style={{ minWidth: '33rem', padding: '1rem' }}>
                <div className="card text-center">
                  <div className="card-header">
                    FORMULARIO DE REGISTRO
                  </div>
                  <div className="card-body">
                    <div className="input-group mb-3">
                      <span className="input-group-text" id="basic-addon1">Producto</span>
                      <input 
                        type="text"
                        onChange={(event) => setProducto(event.target.value)}
                        className="form-control" value={Producto}
                        placeholder="Ingrese el nombre del Producto" 
                        aria-label="Producto" 
                        aria-describedby="basic-addon1" 
                      />
                    </div>
                    <div className="input-group mb-3">
                      <span className="input-group-text" id="basic-addon1">Fecha de entrada</span>
                      <input 
                        type="date"
                        onChange={(event) => setFecha(event.target.value)}
                        className="form-control" value={Fecha}
                        placeholder="Ingrese la fecha de entrada" 
                        aria-label="Fecha de entrada" 
                        aria-describedby="basic-addon1" 
                      />
                    </div>
                    <div className="input-group mb-3">
                      <span className="input-group-text" id="basic-addon1">Fecha de caducidad</span>
                      <input 
                        type="date"
                        onChange={(event) => setCaducidad(event.target.value)}
                        className="form-control" value={Caducidad}
                        placeholder="Ingrese la fecha de caducidad"
                        aria-label="Fecha de caducidad" 
                        aria-describedby="basic-addon1" 
                      />
                    </div>
                    <div className="input-group mb-3">
                      <span className="input-group-text" id="basic-addon1">Cantidad</span>
                      <input 
                        type="number"
                        onChange={(event) => setCantidad(event.target.value)}
                        className="form-control" value={Cantidad}
                        placeholder="Ingrese la cantidad del producto" 
                        aria-label="Cantidad" 
                        aria-describedby="basic-addon1" 
                      />
                    </div>
                    <div className="input-group mb-3">
                      <span className="input-group-text" id="basic-addon1">Costo del Producto</span>
                      <input 
                        type="number"
                        onChange={(event) => setCosto(event.target.value)}
                        className="form-control" value={Costo}
                        placeholder="Ingrese el precio de este producto" 
                        aria-label="Costo del Producto" 
                        aria-describedby="basic-addon1" 
                      />
                    </div>
                  </div>
                  <div className="card-footer text-body-secondary">
                    {
                      editar ?
                        <div>
                          <Button variant="outline-warning" onClick={update}>Actualizar</Button>  
                          <Button variant="outline-danger" onClick={cancelar}>Cancelar</Button>
                        </div>
                        : <Button variant="info" onClick={add}>Registrar</Button>
                    }
                    {advertencia && <p className="text-danger">Por favor, complete todos los campos.</p>}
                  </div>
                </div>
              </Dropdown.Menu>
            </Dropdown>

            <Table striped bordered hover className="table-centered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Fecha de ingreso</th>
                  <th>Fecha de caducidad</th>
                  <th>Cantidad</th>
                  <th>Costo</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((val) => {
                  const currentDate = moment();
                  const expirationDate = moment(val.Caducidad);
                  const isExpired = currentDate.isAfter(expirationDate);
                  const isLowStock = val.Cantidad <= 5;
                  
                  return (
                    <tr key={val.id}>
                      <td>{val.id}</td>
                      <td>{val.Producto}</td>
                      <td>{formattedFecha(val.Fecha)}</td> 
                      <td>{formattedFecha(val.Caducidad)}</td> 
                      <td>{val.Cantidad}</td>
                      <td>{val.Costo}</td>
                      <td className="d-flex align-items-center justify-content-center">
                        <Button variant="primary" onClick={() => editarProducto(val)} className="me-2 btn-custom">Editar</Button>
                        <Button variant="danger" onClick={() => eliminarProducto(val.id)} className="me-2 btn-custom">Eliminar</Button>
                        {(isExpired || isLowStock) && (
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <img 
                              src='/alerta.png'
                              alt="Producto" 
                              onMouseEnter={() => handleMouseEnter(val)}
                              onMouseLeave={() => handleMouseLeave(val)}
                              className="alert-icon"
                            />
                            {hoverMessages[val.id] && <span className="tooltip-text alert-animation">{hoverMessages[val.id]}</span>}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Container>
        } />
      </Routes>
    </Router>
  );
}

export default App;
