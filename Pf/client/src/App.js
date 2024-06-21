import './App.css';
import './backgrounds.css'; // Importa el archivo de estilos de fondo
import React, { useState, useEffect, useCallback } from 'react';
import Axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import FontAwesome
import moment from 'moment';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import { Modal, Form, InputGroup, Button, Table, Navbar, Container, Nav, Dropdown } from 'react-bootstrap';
import Login from './login';
import Register from './Register';
import Dashboard from './Dashboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import logo from './assets/Logos.png';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [hoverMessages, setHoverMessages] = useState({});
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");

  const add = () => {
    if (!Producto || !Fecha || !Caducidad || !Cantidad || !Costo || !userId || !company) {
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
      userId,
      company
    })
    .then((response) => {
      const newProduct = { id: response.data.id, Producto, Fecha, Caducidad, Cantidad, Costo, company };
      setProductos([...productosList, newProduct]);
      toast.success("Producto registrado");
      cancelar();
    })
    .catch(error => {
      toast.error("Error al registrar el producto: " + error.message);
    });
  }

  const update = () => {
    if (!Producto || !Fecha || !Caducidad || !Cantidad || !Costo || !userId || !company) {
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
      userId,
      company
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
            Costo,
            company
          };
        }
        return product;
      });
      setProductos(updatedProducts);
      toast.success("Producto actualizado");
      cancelar();
    })
    .catch(error => {
      toast.error("Error al actualizar el producto: " + error.message);
    });
  }

  const editarProducto = (val) => {
    setEditar(true);
    setModalOpen(true);

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
    setModalOpen(false);
  }

  const eliminarProducto = (id) => {
    Swal.fire({
      title: '¿Estás seguro de que deseas eliminar este producto?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Axios.delete(`http://localhost:3001/delete/${id}/${userId}/${company}`)
        .then(() => {
          setProductos(productosList.filter(product => product.id !== id));
          toast.success("Producto eliminado");
        })
        .catch(error => {
          toast.error("Error al eliminar el producto: " + error.message);
        });
      }
    });
  }

  const getProductos = useCallback(() => {
    if (company) {
      Axios.get(`http://localhost:3001/productos/${company}`)
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
        toast.error("Error al obtener los productos: " + error.message);
      });
    }
  }, [company]);

  const formattedFecha = (fecha) => {
    return moment(fecha).format('YYYY-MM-DD');
  };

  const productosFiltrados = productosList.filter(producto =>
    producto.Producto.toLowerCase().includes(filtro.toLowerCase())
  );

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    const storedCompany = localStorage.getItem("company");
    if (storedUserId) {
      setUserId(storedUserId);
      setUsername(storedUsername);
      setRole(storedRole);
      setCompany(storedCompany);
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (company) {
      getProductos();
    }
  }, [company, getProductos]);

  const logout = () => {
    Swal.fire({
      title: '¿Estás seguro de que deseas salir?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Cerrar Sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("company");
        setLoggedIn(false);
        setUserId(null);
        setUsername("");
        setRole("");
        setCompany("");
        window.location.href = '/';
      }
    });
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
      <Router>
        <Routes>
          <Route path="/register" element={<Register setLoggedIn={setLoggedIn} />} />
          <Route path="/" element={<Login setLoggedIn={setLoggedIn} setUserId={(userId) => { setUserId(userId); localStorage.setItem("userId", userId); }} setUsername={(username) => { setUsername(username); localStorage.setItem("username", username); }} setRole={(role) => { setRole(role); localStorage.setItem("role", role); }} setCompany={(company) => { setCompany(company); localStorage.setItem("company", company); }} getProductos={getProductos} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 navbar">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img
              src={logo}
              width="130"
              height="130"
              className="d-inline-block align-top"
              alt="Logo"
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="nav-center">
              <CustomNavLink to="/">Productos</CustomNavLink>
              {role === "admin" && <CustomNavLink to="/dashboard">Dashboard</CustomNavLink>}
            </Nav>
            <Nav className="nav-right">
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="nav-link">
                  Bienvenido: {username}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Button} variant="danger" onClick={logout} className="text-white bg-danger logout-button">
                    Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        {role === "admin" && <Route path="/dashboard" element={<Dashboard productosList={productosList} />} />}
        <Route path="/" element={
          <div className="background-container main-background"> {/* Aplica la clase main-background */}
            <Container>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestionar Productos</h2>
                {role === "admin" && <Button variant="primary" onClick={() => setModalOpen(true)}>Registrar un producto</Button>}
              </div>

              <InputGroup className="mb-4">
                <Form.Control
                  type="text"
                  placeholder="Buscar por nombre de producto"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
              </InputGroup>

              <Modal show={modalOpen} onHide={cancelar} centered>
                <Modal.Header closeButton>
                  <Modal.Title>Formulario de Registro</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form>
                    <Form.Group className="mb-3" controlId="formProducto">
                      <Form.Label>Producto</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ingrese el nombre del Producto"
                        value={Producto}
                        onChange={(e) => setProducto(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formFechaEntrada">
                      <Form.Label>Fecha de entrada</Form.Label>
                      <Form.Control
                        type="date"
                        placeholder="Ingrese la fecha de entrada"
                        value={Fecha}
                        onChange={(e) => setFecha(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formFechaCaducidad">
                      <Form.Label>Fecha de caducidad</Form.Label>
                      <Form.Control
                        type="date"
                        placeholder="Ingrese la fecha de caducidad"
                        value={Caducidad}
                        onChange={(e) => setCaducidad(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formCantidad">
                      <Form.Label>Cantidad</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Ingrese la cantidad del producto"
                        value={Cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formCosto">
                      <Form.Label>Costo del Producto</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Ingrese el precio de este producto"
                        value={Costo}
                        onChange={(e) => setCosto(e.target.value)}
                      />
                    </Form.Group>
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  {editar ? (
                    <>
                      <Button variant="warning" onClick={update}>
                        Actualizar
                      </Button>
                      <Button variant="secondary" onClick={cancelar}>
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button variant="primary" onClick={add}>
                      Registrar
                    </Button>
                  )}
                  {advertencia && (
                    <p className="text-danger">Por favor, complete todos los campos.</p>
                  )}
                </Modal.Footer>
              </Modal>

              <Table striped bordered hover className="table-centered">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Fecha de ingreso</th>
                    <th>Fecha de caducidad</th>
                    <th>Cantidad</th>
                    <th>Costo</th>
                    <th>Opciones</th>
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
                          {role === "admin" && (
                            <>
                              <Button variant="primary" onClick={() => editarProducto(val)} className="me-2 btn-custom">Editar</Button>
                              <Button variant="danger" onClick={() => eliminarProducto(val.id)} className="me-2 btn-custom">Eliminar</Button>
                            </>
                          )}
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
              <ToastContainer />
            </Container>
          </div>
        } />
      </Routes>
    </Router>
  );
}

const CustomNavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Nav.Link as={Link} to={to} className={isActive ? 'active-link' : ''}>
      {children}
    </Nav.Link>
  );
};

export default App;
