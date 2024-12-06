async function cargarAlquileres() {
  const API_URL = "https://sistemealquilertemporario-production.up.railway.app";
  const userId = 2;

  try {
    const response = await fetch(`${API_URL}/usuarios/${userId}/propiedades`);
    if (!response.ok) throw new Error("Error al obtener las propiedades");
    const propiedades = await response.json();

    const listaAlquileres = document.getElementById("lista-alquileres");
    listaAlquileres.innerHTML = ""; // Limpiar contenido previo

    for (const propiedad of propiedades) {
      try {
        const alquilerResponse = await fetch(
          `${API_URL}/alquileres/${propiedad.id_propiedad}`
        );
        if (!alquilerResponse.ok)
          throw new Error("No se encontraron alquileres");
        const alquileres = await alquilerResponse.json();

        alquileres.forEach((alquiler) => {
          const card = document.createElement("div");
          card.className = "alquiler-card";

          const monto =
            typeof alquiler.monto === "number"
              ? alquiler.monto.toFixed(2)
              : "0.00";

          card.innerHTML = `
              <h3>${propiedad.nombre}</h3>
              <p><strong>Dirección:</strong> ${propiedad.direccion || "N/A"}</p>
              <p><strong>Fecha Inicio:</strong> ${new Date(
                alquiler.fecha_inicio
              ).toLocaleDateString()}</p>
              <p><strong>Fecha Fin:</strong> ${new Date(
                alquiler.fecha_fin
              ).toLocaleDateString()}</p>
              <p><strong>Monto Total:</strong> $${monto}</p>
            `;
          listaAlquileres.appendChild(card);
        });
      } catch (error) {
        console.error(
          `Error al obtener los alquileres de ${propiedad.nombre}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error al cargar los alquileres:", error);
  }
}
