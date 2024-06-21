import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import Axios from 'axios';

const InviteForm = ({ company }) => {
  const [email, setEmail] = useState("");
  const [inviteError, setInviteError] = useState("");

  const handleInvite = () => {
    Axios.post("http://localhost:3001/send-employee-invitation", { email, company })
      .then(response => {
        alert(response.data.message);
        setEmail("");
        setInviteError("");
      })
      .catch(error => {
        setInviteError(error.response.data.error);
      });
  };

  return (
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
  );
};

export default InviteForm;
