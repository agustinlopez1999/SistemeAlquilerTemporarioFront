document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = "https://sistemealquilertemporario-production.up.railway.app";
  const userId = 1;

  const propiedadesContainer = document.getElementById("lista-propiedades");
  const modal = document.getElementById("modal-editar");
  const formEditar = document.getElementById("form-editar");
  const closeModal = document.querySelector(".modal .close");

  const cargarPropiedades = async () => {
    try {
      const propiedadesResponse = await fetch(
        `${API_URL}/usuarios/${userId}/propiedades`
      );
      const propiedades = await propiedadesResponse.json();

      propiedadesContainer.innerHTML = "";

      propiedades.forEach((propiedad) => {
        const div = document.createElement("div");
        div.classList.add("propiedad");
        div.innerHTML = `
          <h3>${propiedad.nombre}</h3>
          <p>Dirección: ${propiedad.direccion}</p>
          <p>Precio diario: $${propiedad.precio_alquiler_diario}</p>
          <button class="btn-editar" data-id="${propiedad.id_propiedad}">Editar</button>
          <button class="btn-eliminar" data-id="${propiedad.id_propiedad}">Eliminar</button>
        `;
        propiedadesContainer.appendChild(div);
      });

      // Asignar eventos a los botones
      document
        .querySelectorAll(".btn-editar")
        .forEach((btn) =>
          btn.addEventListener("click", (e) =>
            abrirModalEdicion(e.target.dataset.id)
          )
        );

      document
        .querySelectorAll(".btn-eliminar")
        .forEach((btn) =>
          btn.addEventListener("click", (e) =>
            eliminarPropiedad(e.target.dataset.id)
          )
        );
    } catch (error) {
      console.error("Error al cargar propiedades:", error);
    }
  };

  const abrirModalEdicion = async (idPropiedad) => {
    try {
      const propiedadResponse = await fetch(
        `${API_URL}/propiedades/${idPropiedad}`
      );
      const propiedad = await propiedadResponse.json();

      formEditar.nombre.value = propiedad.nombre;
      formEditar.direccion.value = propiedad.direccion || "";
      formEditar.precio.value = propiedad.precio_alquiler_diario;

      formEditar.dataset.id = idPropiedad;
      modal.style.display = "block";
    } catch (error) {
      console.error("Error al obtener la propiedad:", error);
    }
  };

  const eliminarPropiedad = async (idPropiedad) => {
    if (!confirm("¿Estás seguro de eliminar esta propiedad?")) return;

    try {
      const response = await fetch(`${API_URL}/propiedades/${idPropiedad}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Propiedad eliminada correctamente");
        cargarPropiedades();
      } else {
        alert("Error al eliminar la propiedad");
      }
    } catch (error) {
      console.error("Error al eliminar la propiedad:", error);
    }
  };

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  formEditar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const idPropiedad = formEditar.dataset.id;
    const datosActualizados = {
      nombre: formEditar.nombre.value,
      direccion: formEditar.direccion.value,
      precio_alquiler_diario: parseFloat(formEditar.precio.value),
    };

    try {
      const response = await fetch(`${API_URL}/propiedades/${idPropiedad}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosActualizados),
      });

      if (response.ok) {
        alert("Propiedad actualizada correctamente");
        modal.style.display = "none";
        cargarPropiedades();
      } else {
        alert("Error al actualizar la propiedad");
      }
    } catch (error) {
      console.error("Error al actualizar la propiedad:", error);
    }
  });

  cargarPropiedades();
});
