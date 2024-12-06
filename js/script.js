document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = "https://sistemealquilertemporario-production.up.railway.app";
  const userId = 1; // ID del usuario

  const propiedadesContainer = document.getElementById("lista-propiedades");
  const gastosContainer = document.getElementById("lista-gastos");
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

  async function cargarGastos() {
    try {
      // Obtener propiedades del usuario
      const propiedadesResponse = await fetch(
        `${API_URL}/usuarios/${userId}/propiedades`
      );
      if (!propiedadesResponse.ok) {
        throw new Error(
          `Error al cargar las propiedades: ${propiedadesResponse.status}`
        );
      }
      const propiedades = await propiedadesResponse.json();

      const gastosContainer = document.getElementById("lista-gastos");
      gastosContainer.innerHTML = ""; // Limpiar contenedor

      // Recorrer las propiedades y cargar sus gastos
      for (const propiedad of propiedades) {
        const gastosResponse = await fetch(
          `${API_URL}/gastos/${propiedad.id_propiedad}`
        );
        if (!gastosResponse.ok) {
          throw new Error(
            `Error al cargar los gastos para la propiedad ${propiedad.nombre}: ${gastosResponse.status}`
          );
        }
        const gastos = await gastosResponse.json();

        // Mostrar los gastos de esta propiedad
        gastos.forEach((gasto) => {
          const div = document.createElement("div");
          div.classList.add("gasto");

          // Validar si monto es un número válido
          const monto = typeof gasto.monto === "number" ? gasto.monto : 0;

          div.innerHTML = `
            <h3>${gasto.descripcion}</h3>
            <p>Propiedad: ${propiedad.nombre}</p>
            <p>Fecha: ${new Date(gasto.fecha).toLocaleDateString()}</p>
            <p>Monto: $${monto.toFixed(2)}</p>
          `;
          gastosContainer.appendChild(div);
        });
      }
    } catch (error) {
      console.error("Error al cargar los gastos:", error);
    }
  }

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
  cargarGastos();
});
