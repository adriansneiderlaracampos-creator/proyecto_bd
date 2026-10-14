const API_URL = "http://localhost:3000";

// Elementos del DOM
const listaProductos = document.getElementById("listaProductos");
const formulario = document.getElementById("formularioProducto");
const productoId = document.getElementById("productoId");
const nombreInput = document.getElementById("nombre");
const precioInput = document.getElementById("precio");
const stockInput = document.getElementById("stock");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const tituloFormulario = document.getElementById("tituloFormulario");
const formContacto = document.getElementById("formularioContacto");

// 1. Consultar productos
async function cargarProductos() {
  if (!listaProductos) return;

  try {
    const respuesta = await fetch(`${API_URL}/productos`);
    const productos = await respuesta.json();

    listaProductos.innerHTML = "";

    if (productos.length === 0) {
      listaProductos.innerHTML = "<p style='color: #64748b;'>No hay productos registrados.</p>";
      return;
    }

    productos.forEach((producto) => {
      const elemento = document.createElement("div");
      elemento.classList.add("producto");

      elemento.innerHTML = `
        <div>
          <h3>${producto.nombre}</h3>
          <p class="producto-precio">Precio: $${producto.precio}</p>
          <p>Stock: ${producto.stock} unidades</p>
        </div>
        <div class="acciones">
          <button class="btn-editar" onclick="cargarEnFormulario(${producto.id}, '${producto.nombre}', ${producto.precio}, ${producto.stock})">Editar</button>
          <button class="btn-eliminar" onclick="eliminarProducto(${producto.id})">Eliminar</button>
        </div>
      `;

      listaProductos.appendChild(elemento);
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

// 2. Cargar producto para editar
function cargarEnFormulario(id, nombre, precio, stock) {
  productoId.value = id;
  nombreInput.value = nombre;
  precioInput.value = precio;
  stockInput.value = stock;

  tituloFormulario.textContent = "Editar Producto";
  btnGuardar.textContent = "Actualizar Producto";
  btnCancelar.style.display = "block";
  nombreInput.focus();
}

// Cancelar edición
function cancelarEdicion() {
  formulario.reset();
  productoId.value = "";
  tituloFormulario.textContent = "Registrar Producto";
  btnGuardar.textContent = "Guardar Producto";
  btnCancelar.style.display = "none";
}

if (btnCancelar) {
  btnCancelar.addEventListener("click", cancelarEdicion);
}

// 3. Crear o actualizar productos
if (formulario) {
  formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = productoId.value;
    const nombre = nombreInput.value;
    const precio = precioInput.value;
    const stock = stockInput.value;

    try {
      if (id) {
        await fetch(`${API_URL}/productos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, precio, stock }),
        });
      } else {
        await fetch(`${API_URL}/productos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, precio, stock }),
        });
      }

      cancelarEdicion();
      cargarProductos();
    } catch (error) {
      console.error("Error al guardar el producto:", error);
    }
  });
}

// 4. Eliminar producto
async function eliminarProducto(id) {
  const confirmar = confirm("¿Deseas eliminar este producto de la base de datos?");
  if (!confirmar) return;

  try {
    await fetch(`${API_URL}/productos/${id}`, {
      method: "DELETE",
    });

    if (productoId.value == id) {
      cancelarEdicion();
    }

    cargarProductos();
  } catch (error) {
    console.error("Error al eliminar producto:", error);
  }
}

// 5. Enviar formulario de contacto
if (formContacto) {
  formContacto.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = document.getElementById("contactoNombre").value.trim();
    const email = document.getElementById("contactoEmail").value.trim();
    const asunto = document.getElementById("contactoAsunto").value.trim();
    const comentarios = document.getElementById("contactoComentarios").value.trim();
    const estado = document.getElementById("estadoContacto");
    const boton = document.getElementById("btnEnviarContacto");

    try {
      boton.disabled = true;
      estado.textContent = "Enviando mensaje...";

      const respuesta = await fetch(`${API_URL}/contacto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, asunto, comentarios }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || "No se pudo enviar el mensaje");
      }

      estado.textContent = "¡Mensaje enviado correctamente!";
      formContacto.reset();

      // NUEVO: actualizar comentarios después de guardar
      cargarComentarios();
    } catch (error) {
      console.error("Error al enviar el contacto:", error);
      estado.textContent = error.message || "No se pudo conectar con el servidor.";
    } finally {
      boton.disabled = false;
    }
  });
}

// 6. NUEVO: consultar y mostrar comentarios
async function cargarComentarios() {
  const lista = document.getElementById("listaComentariosContacto");
  if (!lista) return;

  try {
    const respuesta = await fetch(`${API_URL}/contacto`);
    const comentarios = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error("Error al consultar comentarios");
    }

    lista.innerHTML = "";

    if (comentarios.length === 0) {
      lista.innerHTML = "<p>Todavía no hay comentarios.</p>";
      return;
    }

    comentarios.forEach((c) => {
      const elemento = document.createElement("div");
      elemento.style.cssText =
        "background:white;border:1px solid #ddd;border-left:4px solid #b5121b;padding:15px;margin:12px 0;border-radius:6px;";

      const titulo = document.createElement("h3");
      titulo.textContent = c.asunto || "Comentario";
      titulo.style.color = "#b5121b";

      const nombre = document.createElement("p");
      nombre.textContent = "Nombre: " + c.nombre;

      const email = document.createElement("p");
      email.textContent = "Correo: " + c.email;

      const texto = document.createElement("p");
      texto.textContent = c.comentarios;

      const fecha = document.createElement("p");
      fecha.textContent = "Fecha: " + (c.fecha || "");

      const boton = document.createElement("button");
      boton.textContent = "Eliminar comentario";
      boton.style.cssText =
        "background:#b5121b;color:white;border:0;padding:10px;border-radius:5px;cursor:pointer;";

      boton.addEventListener("click", function () {
        eliminarComentario(c.id);
      });

      elemento.append(titulo, nombre, email, texto, fecha, boton);
      lista.appendChild(elemento);
    });
  } catch (error) {
    console.error("Error al cargar comentarios:", error);
    lista.innerHTML = "<p>No se pudieron cargar los comentarios.</p>";
  }
}

// 7. NUEVO: eliminar comentario
async function eliminarComentario(id) {
  if (!confirm("¿Deseas eliminar este comentario?")) return;

  try {
    const respuesta = await fetch(`${API_URL}/contacto/${id}`, {
      method: "DELETE",
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "No se pudo eliminar");
    }

    cargarComentarios();
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    alert("No se pudo eliminar el comentario.");
  }
}

// Llamados iniciales
cargarProductos();
cargarComentarios();