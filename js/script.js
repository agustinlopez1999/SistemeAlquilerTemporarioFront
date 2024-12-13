document.addEventListener("DOMContentLoaded", () => {
  const userId = 2; // Cambiar según el usuario deseado
  cargarPropiedades(userId);
  cargarAlquileres(userId);

  const btnAgregarPropiedad = document.getElementById("btn-agregar-propiedad");
  btnAgregarPropiedad.addEventListener("click", () => abrirModal());

  const btnAgregarAlquiler = document.getElementById("btn-agregar-alquiler");
  btnAgregarAlquiler.addEventListener("click", () =>
    abrirModalAlquiler(userId)
  );

  const formPropiedad = document.getElementById("form-propiedad");
  formPropiedad.addEventListener("submit", (event) =>
    guardarPropiedad(event, userId)
  );

  const formAlquiler = document.getElementById("form-alquiler");
  formAlquiler.addEventListener("submit", (event) =>
    guardarAlquiler(event, userId)
  );
});

const API_URL = "https://sistemealquilertemporario-production.up.railway.app";

// Función para cargar propiedades desde la API
async function cargarPropiedades(userId) {
  try {
    const response = await fetch(`${API_URL}/propiedades/usuario/${userId}`);
    if (!response.ok) throw new Error("Error al cargar propiedades");
    const propiedades = await response.json();

    const listaPropiedades = document.getElementById("lista-propiedades");
    listaPropiedades.innerHTML = ""; // Limpia el contenedor antes de cargar nuevas propiedades

    propiedades.forEach((propiedad) => {
      listaPropiedades.appendChild(crearElementoPropiedad(propiedad, userId));
    });
  } catch (error) {
    console.error("Error al cargar las propiedades:", error);
  }
}

// Función para crear un elemento de propiedad
function crearElementoPropiedad(propiedad, userId) {
  const div = document.createElement("div");
  div.classList.add("propiedad-card");

  div.innerHTML = `
    <h3>${propiedad.nombre}</h3>
    <p><strong>Dirección:</strong> ${propiedad.direccion}</p>
    <p><strong>Descripción:</strong> ${
      propiedad.descripcion || "Sin descripción"
    }</p>
    <p><strong>Precio Diario:</strong> $${
      propiedad.precio_alquiler_diario || 0
    }</p>
    <p><strong>Valor Propiedad:</strong> $${propiedad.valor_propiedad || 0}</p>
    <p><strong>Habitaciones:</strong> ${
      propiedad.cantidad_habitaciones || 0
    }</p>
    <p><strong>Ambientes:</strong> ${propiedad.cantidad_ambientes || 0}</p>
    <p><strong>Baños:</strong> ${propiedad.cantidad_banos || 0}</p>
    <p><strong>Capacidad Máxima:</strong> ${propiedad.capacidad_maxima || 0}</p>
    <p><strong>Estado:</strong> <span class="status">${
      propiedad.status || "Desconocido"
    }</span></p>
    <button class="btn editar" data-id="${
      propiedad.id_propiedad
    }">Editar</button>
    <button class="btn eliminar" data-id="${
      propiedad.id_propiedad
    }">Eliminar</button>
  `;

  // Asignar eventos a los botones
  const btnEditar = div.querySelector(".editar");
  const btnEliminar = div.querySelector(".eliminar");

  btnEditar.addEventListener("click", () => abrirModal(propiedad));
  btnEliminar.addEventListener("click", () =>
    confirmarEliminarPropiedad(propiedad.id_propiedad, userId)
  );

  return div;
}

// Función para abrir el modal para agregar o editar propiedad
function abrirModal(propiedad = null) {
  const modal = document.getElementById("modal-propiedad");
  const titulo = document.getElementById("modal-titulo");
  const form = document.getElementById("form-propiedad");

  modal.style.display = "block";
  form.reset();

  if (propiedad) {
    form["id-propiedad"].value = propiedad.id_propiedad;
    form["nombre"].value = propiedad.nombre;
    form["direccion"].value = propiedad.direccion;
    form["descripcion"].value = propiedad.descripcion || "";
    form["precio"].value = propiedad.precio_alquiler_diario;
    form["valor"].value = propiedad.valor_propiedad || "";
    form["habitaciones"].value = propiedad.cantidad_habitaciones || "";
    form["ambientes"].value = propiedad.cantidad_ambientes || "";
    form["banos"].value = propiedad.cantidad_banos || "";
    form["capacidad"].value = propiedad.capacidad_maxima || "";
    form["status"].value = propiedad.status || "activo";

    titulo.textContent = "Editar Propiedad";
  } else {
    titulo.textContent = "Nueva Propiedad";
  }
}

// Función para guardar (crear o editar) una propiedad
async function guardarPropiedad(event, userId) {
  event.preventDefault();

  const form = event.target;
  const nombre = form["nombre"].value.trim();
  const direccion = form["direccion"].value.trim();
  const precio = form["precio"].value.trim();
  const valor = form["valor"].value.trim();

  // Validaciones
  if (!nombre || !direccion || !precio || !valor) {
    alert("Todos los campos marcados son obligatorios.");
    return;
  }

  const propiedad = {
    nombre: nombre,
    direccion: direccion,
    descripcion: form["descripcion"].value.trim(),
    precio_alquiler_diario: parseFloat(precio),
    valor_propiedad: parseFloat(valor),
    cantidad_habitaciones: parseInt(form["habitaciones"].value) || 0,
    cantidad_ambientes: parseInt(form["ambientes"].value) || 0,
    cantidad_banos: parseInt(form["banos"].value) || 0,
    capacidad_maxima: parseInt(form["capacidad"].value) || 0,
    status: form["status"] ? form["status"].value : "activo",
    id_usuario: userId,
  };

  try {
    const idPropiedad = form["id-propiedad"].value;
    const url = idPropiedad
      ? `${API_URL}/propiedades/${idPropiedad}`
      : `${API_URL}/propiedades`;
    const method = idPropiedad ? "PUT" : "POST";

    await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(propiedad),
    });

    cargarPropiedades(userId);
    document.getElementById("modal-propiedad").style.display = "none";

    form.reset();
  } catch (error) {
    console.error("Error al guardar la propiedad:", error);
  }
}

// Función para eliminar una propiedad con confirmación
function confirmarEliminarPropiedad(id, userId) {
  const confirmar = confirm(
    "¿Estás seguro de que deseas eliminar esta propiedad?"
  );
  if (confirmar) {
    eliminarPropiedad(id, userId);
  }
}

// Función para eliminar una propiedad
async function eliminarPropiedad(id, userId) {
  try {
    const response = await fetch(
      `${API_URL}/propiedades/${id}?id_usuario=${userId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(`Error al eliminar la propiedad: ${response.statusText}`);
    }

    cargarPropiedades(userId);
  } catch (error) {
    console.error(`Error al eliminar la propiedad: ${error.message}`);
  }
}

// Función para cargar alquileres del usuario
async function cargarAlquileres(userId) {
  try {
    const response = await fetch(`${API_URL}/alquileres/usuario/${userId}`);
    if (!response.ok) throw new Error("Error al obtener los alquileres");

    const alquileres = await response.json();
    const listaAlquileres = document.getElementById("lista-alquileres");
    listaAlquileres.innerHTML = ""; // Limpia la lista antes de renderizar

    alquileres.forEach((alquiler) => {
      const alquilerCard = document.createElement("div");
      alquilerCard.className = "alquiler-card";

      const fechaInicio = new Date(alquiler.fecha_inicio).toLocaleDateString(
        "es-AR"
      );
      const fechaFin = new Date(alquiler.fecha_fin).toLocaleDateString("es-AR");

      alquilerCard.innerHTML = `
        <h4>${alquiler.propiedad}</h4>
        <p>Fecha Inicio: ${fechaInicio}</p>
        <p>Fecha Fin: ${fechaFin}</p>
        <p>Monto: $${alquiler.monto}</p>
        <p>Estado: <strong>${alquiler.status}</strong></p>
      `;

      listaAlquileres.appendChild(alquilerCard);
    });
  } catch (error) {
    console.error("Error al cargar los alquileres:", error);
  }
}
// Función para abrir el modal de alquiler
function abrirModalAlquiler(userId) {
  const modal = document.getElementById("modal-alquiler");
  modal.style.display = "block";

  const propiedadSelect = document.getElementById("propiedad-alquiler");
  propiedadSelect.innerHTML = ""; // Limpia el selector antes de agregar opciones

  fetch(`${API_URL}/propiedades/usuario/${userId}`)
    .then((response) => response.json())
    .then((propiedades) => {
      propiedades.forEach((propiedad) => {
        const option = document.createElement("option");
        option.value = propiedad.id_propiedad;
        option.textContent = propiedad.nombre;
        propiedadSelect.appendChild(option);
      });
    })
    .catch((error) => console.error("Error al cargar propiedades:", error));
}

// Función para guardar un alquiler
async function guardarAlquiler(event, userId) {
  event.preventDefault();

  const idPropiedad = document
    .getElementById("propiedad-alquiler")
    .value.trim();
  const fechaInicio = document.getElementById("fecha-inicio").value.trim();
  const fechaFin = document.getElementById("fecha-fin").value.trim();
  const monto = document.getElementById("monto-alquiler").value.trim();

  // Validaciones
  if (!idPropiedad || !fechaInicio || !fechaFin || !monto) {
    alert("Todos los campos son obligatorios.");
    return;
  }

  const alquiler = {
    id_propiedad: parseInt(idPropiedad, 10),
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    monto: parseFloat(monto),
  };

  try {
    const response = await fetch(`${API_URL}/alquileres`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(alquiler),
    });

    if (!response.ok) {
      throw new Error(`Error al registrar el alquiler: ${response.statusText}`);
    }

    cargarAlquileres(userId);
    document.getElementById("modal-alquiler").style.display = "none";
    document.getElementById("form-alquiler").reset();
  } catch (error) {
    console.error("Error al guardar el alquiler:", error);
    alert("Hubo un error al registrar el alquiler. Intenta nuevamente.");
  }
}
