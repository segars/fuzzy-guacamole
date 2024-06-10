import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import moment from 'moment';

const Dashboard = ({ productosList }) => {
  const totalProductos = productosList.length;
  const productosPorVencer = productosList.filter(producto => moment(producto.Caducidad).isBefore(moment().add(7, 'days'))).length;
  const productosBajoStock = productosList.filter(producto => producto.Cantidad <= 5).length;
  const costoTotal = productosList.reduce((total, producto) => total + parseFloat(producto.Costo), 0);

  const data = {
    labels: ['Total Productos', 'Por Vencer', 'Bajo Stock', 'Costo Total'],
    datasets: [
      {
        label: 'Inventario',
        data: [totalProductos, productosPorVencer, productosBajoStock, costoTotal],
        backgroundColor: ['#007bff', '#ffc107', '#dc3545', '#28a745']
      }
    ]
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Dashboard de Inventario</h2>
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Cantidad Total de Productos</Card.Title>
              <Card.Text>{totalProductos}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Productos por Vencer</Card.Title>
              <Card.Text>{productosPorVencer}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Productos con Bajo Stock</Card.Title>
              <Card.Text>{productosBajoStock}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Costo Total del Inventario</Card.Title>
              <Card.Text>${costoTotal.toFixed(2)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <Card>
            <Card.Body>
              <Card.Title>Estadísticas del Inventario</Card.Title>
              <Bar data={data} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
