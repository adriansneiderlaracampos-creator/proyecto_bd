const express = require("express");
const cors = require("cors");
const conexion = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("Servidor funcionando correctamente");
});

// ===============================
// PRODUCTOS
// ===============================

// Consultar productos
app.get("/productos", (req, res) => {
    conexion.query("SELECT * FROM productos", (error, resultados) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                mensaje: "Error al consultar productos"
            });
        }

        res.json(resultados);
    });
});

// Crear producto
app.post("/productos", (req, res) => {
    const { nombre, precio, stock } = req.body;

    const sql = `
        INSERT INTO productos (nombre, precio, stock)
        VALUES (?, ?, ?)
    `;

    conexion.query(sql, [nombre, precio, stock], (error, resultado) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                mensaje: "Error al crear el producto"
            });
        }

        res.status(201).json({
            mensaje: "Producto creado correctamente",
            id: resultado.insertId
        });
    });
});

// Actualizar producto
app.put("/productos/:id", (req, res) => {
    const { nombre, precio, stock } = req.body;
    const { id } = req.params;

    const sql = `
        UPDATE productos
        SET nombre = ?, precio = ?, stock = ?
        WHERE id = ?
    `;

    conexion.query(sql, [nombre, precio, stock, id], (error) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                mensaje: "Error al actualizar el producto"
            });
        }

        res.json({
            mensaje: "Producto actualizado correctamente"
        });
    });
});

// Eliminar producto
app.delete("/productos/:id", (req, res) => {
    conexion.query(
        "DELETE FROM productos WHERE id = ?",
        [req.params.id],
        (error, resultado) => {
            if (error) {
                console.error(error);
                return res.status(500).json({
                    mensaje: "Error al eliminar el producto"
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: "Producto no encontrado"
                });
            }

            res.json({
                mensaje: "Producto eliminado correctamente"
            });
        }
    );
});

// ===============================
// CONTACTO
// ===============================

// Guardar un comentario
app.post("/contacto", (req, res) => {
    const { nombre, email, asunto, comentarios } = req.body;

    if (
        !nombre?.trim() ||
        !email?.trim() ||
        !asunto?.trim() ||
        !comentarios?.trim()
    ) {
        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios"
        });
    }

    const sql = `
        INSERT INTO contacto
        (nombre, email, asunto, comentarios)
        VALUES (?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [
            nombre.trim(),
            email.trim(),
            asunto.trim(),
            comentarios.trim()
        ],
        (error, resultado) => {
            if (error) {
                console.error(error);
                return res.status(500).json({
                    mensaje: "Error al guardar el comentario"
                });
            }

            res.status(201).json({
                mensaje: "Comentario guardado correctamente",
                id: resultado.insertId
            });
        }
    );
});

// Consultar comentarios
app.get("/contacto", (req, res) => {
    const sql = "SELECT * FROM contacto ORDER BY fecha DESC";

    conexion.query(sql, (error, resultados) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                mensaje: "Error al consultar los comentarios"
            });
        }

        res.json(resultados);
    });
});

// Eliminar comentario
app.delete("/contacto/:id", (req, res) => {
    const sql = "DELETE FROM contacto WHERE id = ?";

    conexion.query(sql, [req.params.id], (error, resultado) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                mensaje: "Error al eliminar el comentario"
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Comentario no encontrado"
            });
        }

        res.json({
            mensaje: "Comentario eliminado correctamente"
        });
    });
});

// ===============================
// INICIAR SERVIDOR
// ===============================

app.listen(3000, () => {
    console.log("Servidor funcionando en http://localhost:3000");
});