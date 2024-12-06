document.addEventListener("DOMContentLoaded", () => {
  const userId = 1; // Cambiar según el usuario deseado
  cargarPropiedades(userId);

  const btnAgregarPropiedad = document.getElementById("btn-agregar-propiedad");
  btnAgregarPropiedad.addEventListener("click", () => abrirModal());

  const formPropiedad = document.getElementById("form-propiedad");
  formPropiedad.addEventListener("submit", (event) =>
    guardarPropiedad(event, userId)
  );
});

const API_URL = "https://sistemealquilertemporario-production.up.railway.app";

// Función para cargar propiedades desde la API
async function cargarPropiedades(userId) {
  try {
    console.log("Cargando propiedades para el usuario:", userId);
    const response = await fetch(`${API_URL}/propiedades/usuario/${userId}`);
    if (!response.ok) throw new Error("Error al cargar propiedades");
    const propiedades = await response.json();

    const listaPropiedades = document.getElementById("lista-propiedades");
    listaPropiedades.innerHTML = "";

    propiedades.forEach((propiedad) => {
      const div = document.createElement("div");
      div.classList.add("propiedad-card");

      div.innerHTML = `
        <h3>${propiedad.nombre}</h3>
        <p><strong>Dirección:</strong> ${propiedad.direccion}</p>
        <p><strong>Precio Diario:</strong> $${
          propiedad.precio_alquiler_diario || 0
        }</p>
        <button class="btn editar" data-id="${
          propiedad.id_propiedad
        }">Editar</button>
        <button class="btn eliminar" data-id="${
          propiedad.id_propiedad
        }">Eliminar</button>
      `;

      listaPropiedades.appendChild(div);
    });

    // Asignar eventos a botones
    document
      .querySelectorAll(".editar")
      .forEach((btn) =>
        btn.addEventListener("click", (e) =>
          editarPropiedad(e.target.dataset.id, propiedades)
        )
      );

    document
      .querySelectorAll(".eliminar")
      .forEach((btn) =>
        btn.addEventListener("click", (e) =>
          confirmarEliminarPropiedad(e.target.dataset.id)
        )
      );
  } catch (error) {
    console.error("Error al cargar las propiedades:", error);
  }
}

// Función para abrir el modal con los datos de una propiedad
function editarPropiedad(id, propiedades) {
  const propiedad = propiedades.find((p) => p.id_propiedad == id);

  if (!propiedad) {
    console.error(`Propiedad con ID ${id} no encontrada`);
    return;
  }

  // Carga los datos de la propiedad en el modal
  document.getElementById("id-propiedad").value = propiedad.id_propiedad;
  document.getElementById("nombre").value = propiedad.nombre;
  document.getElementById("direccion").value = propiedad.direccion;
  document.getElementById("precio").value = propiedad.precio_alquiler_diario;

  // Cambia el título del modal
  document.getElementById("modal-titulo").innerText = "Editar Propiedad";

  // Muestra el modal
  document.getElementById("modal-propiedad").style.display = "block";
}

window.editarPropiedad = editarPropiedad;

// Función para abrir el modal
function abrirModal(propiedad = null) {
  const modal = document.getElementById("modal-propiedad");
  const titulo = document.getElementById("modal-titulo");
  const form = document.getElementById("form-propiedad");

  modal.style.display = "block";
  form.reset();

  if (propiedad) {
    titulo.textContent = "Editar Propiedad";
    form["id-propiedad"].value = propiedad.id_propiedad;
    form["nombre"].value = propiedad.nombre;
    form["direccion"].value = propiedad.direccion;
    form["precio"].value = propiedad.precio_alquiler_diario;
  } else {
    titulo.textContent = "Nueva Propiedad";
  }
}

// Función para guardar (crear o editar) una propiedad
async function guardarPropiedad(event, userId) {
  event.preventDefault();

  const form = event.target;
  const idPropiedad = form["id-propiedad"].value;
  const nombre = form["nombre"].value;
  const direccion = form["direccion"].value;
  const precio_alquiler_diario = form["precio"].value;

  const propiedad = {
    nombre,
    direccion,
    precio_alquiler_diario,
    id_usuario: userId,
  };

  try {
    console.log("Guardando propiedad:", propiedad);
    if (idPropiedad) {
      await fetch(`${API_URL}/propiedades/${idPropiedad}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propiedad),
      });
    } else {
      await fetch(`${API_URL}/propiedades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propiedad),
      });
    }

    cargarPropiedades(userId);
    document.getElementById("modal-propiedad").style.display = "none";
  } catch (error) {
    console.error("Error al guardar la propiedad:", error);
  }
}

// Función para eliminar una propiedad con confirmación
function confirmarEliminarPropiedad(id) {
  const confirmar = confirm(
    "¿Estás seguro de que deseas eliminar esta propiedad?"
  );
  if (confirmar) {
    eliminarPropiedad(id);
  }
}

// Función para eliminar una propiedad
async function eliminarPropiedad(id) {
  try {
    console.log("Eliminando propiedad con ID:", id);
    const response = await fetch(`${API_URL}/propiedades/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Error al eliminar la propiedad");

    const userId = 1;
    cargarPropiedades(userId);
  } catch (error) {
    console.error("Error al eliminar la propiedad:", error);
  }
}
