import React, { useState, useEffect } from "react";
import { Table, Button, Alert, Spinner, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import * as XLSX from "xlsx";

const ListaClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/clientes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const clientesData = Array.isArray(response.data) ? response.data : [];
        console.log("Datos de clientes recibidos:", clientesData);
        setClientes(clientesData);
      } catch (err) {
        setError(`❌ Error al cargar los clientes: ${err.message}`);
      } finally {
        setCargando(false);
      }
    };
    fetchClientes();
  }, []);

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/clientes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClientes(clientes.filter((cliente) => cliente._id !== id));
      } catch (err) {
        setError(`❌ Error al eliminar el cliente: ${err.message}`);
      }
    }
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtrarClientes());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
    XLSX.writeFile(workbook, "clientes_completos.xlsx");
  };

  const filtrarClientes = () => {
    let filtered = [...clientes];
    if (busqueda) {
      filtered = filtered.filter(
        (cliente) =>
          cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          cliente.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
          cliente.numeroIdentificacion.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    if (filtroEstado) {
      filtered = filtered.filter((cliente) => {
        const estado = cliente.estado ? cliente.estado.toString().toLowerCase() : "";
        return estado === filtroEstado.toLowerCase();
      });
    }
    return filtered;
  };

  if (cargando) {
    return <Spinner animation="border" variant="primary" />;
  }

  return (
    <div className="container mt-4">
      <h2>Lista de Clientes</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <div className="mb-3">
        <Form.Control
          type="text"
          placeholder="Buscar por nombre, apellido o número de ID..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="mb-2"
          style={{ maxWidth: "300px" }}
        />
        <Form.Select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="mb-2"
          style={{ maxWidth: "200px", display: "inline-block", marginLeft: "10px" }}
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </Form.Select>
        <div>
          <Link to="/clientes/crear">
            <Button variant="primary" className="me-2">
              Agregar Cliente
            </Button>
          </Link>
          <Button variant="success" onClick={handleExportExcel}>
            Descargar Excel
          </Button>
        </div>
      </div>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Estado</th>
            <th>Número ID</th>
            <th>Fecha Nacimiento</th>
            <th>Edad</th>
            <th>Tipo Documento</th>
            <th>RH</th>
            <th>EPS</th>
            <th>Talla Superior</th>
            <th>Talla Inferior</th>
            <th>Responsable</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtrarClientes().length > 0 ? (
            filtrarClientes().map((cliente) => (
              <tr key={cliente._id}>
                <td>{cliente.nombre || "No especificado"}</td>
                <td>{cliente.apellido || "No especificado"}</td>
                <td>{cliente.email || "No especificado"}</td>
                <td>{cliente.telefono || "No especificado"}</td>
                <td>{cliente.direccion || "No especificado"}</td>
                <td>{cliente.estado || "No especificado"}</td>
                <td>{cliente.numeroIdentificacion || "No especificado"}</td>
                <td>{cliente.fechaNacimiento || "No especificado"}</td>
                <td>{cliente.edad || "No especificado"}</td>
                <td>{cliente.tipoDocumento || "No especificado"}</td>
                <td>{cliente.rh || "No especificado"}</td>
                <td>{cliente.eps || "No especificado"}</td>
                <td>{cliente.tallaTrenSuperior || "No especificado"}</td>
                <td>{cliente.tallaTrenInferior || "No especificado"}</td>
                <td>{cliente.nombreResponsable || "No especificado"}</td>
                <td>
                  <Link to={`/clientes/editar/${cliente._id}`}>
                    <Button variant="warning" className="me-2">
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    onClick={() => handleEliminar(cliente._id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="16" className="text-center">
                No hay clientes que coincidan con la búsqueda
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ListaClientes;
