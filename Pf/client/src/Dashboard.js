import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Card, Container, Row, Col, Button, Collapse, Form } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController,
} from 'chart.js';
import moment from 'moment';
import Axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController);

const Dashboard = ({ productosList, company }) => {
  const chartRef = useRef(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteError, setInviteError] = useState("");

  const totalProductos = productosList.length;
  const productosPorVencerList = productosList.filter(producto => {
    const currentDate = moment();
    const expirationDate = moment(producto.Caducidad);
    return expirationDate.isBetween(currentDate, currentDate.clone().add(7, 'days'));
  });
  const productosBajoStockList = productosList.filter(producto => producto.Cantidad <= 5);
  const productosPorVencer = productosPorVencerList.length;
  const productosBajoStock = productosBajoStockList.length;
  const costoTotal = productosList.reduce((acc, producto) => acc + parseFloat(producto.Costo), 0);

  const data = useMemo(() => ({
    labels: ['Total Productos', 'Por Vencer', 'Bajo Stock', 'Costo Total'],
    datasets: [
      {
        label: 'Inventario',
        backgroundColor: ['#007bff', '#ffc107', '#dc3545', '#28a745'],
        data: [totalProductos, productosPorVencer, productosBajoStock, costoTotal],
      },
    ],
  }), [totalProductos, productosPorVencer, productosBajoStock, costoTotal]);

  const options = useMemo(() => ({
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }), []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    const ctx = document.getElementById('inventoryChart').getContext('2d');
    chartRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: data,
      options: options,
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, options]);

  const handleInvite = () => {
    Axios.post("http://localhost:3001/send-employee-invitation", { email, company })
      .then(response => {
        alert(response.data.message);
        setEmail("");
        setShowInviteForm(false);
        setInviteError("");
      })
      .catch(error => {
        setInviteError(error.response.data.error);
      });
  };

  return (
    <Container>
      <h2 className="dashboard-title">Dashboard de Inventario</h2>
      <Row>
        <Col md={6}>
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>Costo Total del Inventario</Card.Title>
              <Card.Text>${costoTotal.toFixed(2)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>Cantidad Total de Productos</Card.Title>
              <Card.Text>{totalProductos}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md={4}>
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>Productos por Vencer</Card.Title>
              <Card.Text>{productosPorVencer}</Card.Text>
              <ul>
                {productosPorVencerList.map(producto => (
                  <li key={producto.id}>{producto.Producto} - Vence el: {moment(producto.Caducidad).format('YYYY-MM-DD')}</li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>Productos con Bajo Stock</Card.Title>
              <Card.Text>{productosBajoStock}</Card.Text>
              <ul>
                {productosBajoStockList.map(producto => (
                  <li key={producto.id}>{producto.Producto} - Cantidad: {producto.Cantidad}</li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>Productos Vencidos</Card.Title>
              <Card.Text>{productosList.filter(producto => moment(producto.Caducidad).isBefore(moment())).length}</Card.Text>
              <ul>
                {productosList.filter(producto => moment(producto.Caducidad).isBefore(moment())).map(producto => (
                  <li key={producto.id}>{producto.Producto} - Venció el: {moment(producto.Caducidad).format('YYYY-MM-DD')}</li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <Button onClick={() => setShowInviteForm(!showInviteForm)} aria-controls="invite-form" aria-expanded={showInviteForm}>
            {showInviteForm ? 'Ocultar Formulario de Invitación' : 'Mostrar Formulario de Invitación'}
          </Button>
          <Collapse in={showInviteForm}>
            <div id="invite-form" className="mt-4">
              <Card>
                <Card.Body>
                  <Form>
                    <Form.Group controlId="formInviteEmail">
                      <Form.Label>Correo Electrónico del Empleado</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Ingrese el correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </Form.Group>
                    <Button className="mt-3" onClick={handleInvite}>Enviar Invitación</Button>
                    {inviteError && <p className="text-danger mt-2">{inviteError}</p>}
                  </Form>
                </Card.Body>
              </Card>
            </div>
          </Collapse>
        </Col>
      </Row>
      <Card className="dashboard-card mt-4 chart-card">
        <Card.Body>
          <Card.Title>Estadísticas del Inventario</Card.Title>
          <div className="chart-container">
            <canvas id="inventoryChart"></canvas>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Dashboard;
