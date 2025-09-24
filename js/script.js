const url = "https://raw.githubusercontent.com/CesarMCuellarCha/apis/main/SENA-CTPI.matriculados.json";

//  inicio de sesion
function login() {
  const usuario = document.getElementById("usuario").value.trim();
  const password = document.getElementById("password").value;

  if (!usuario || !password) {
    alert("Por favor ingresa usuario y contraseña.");
    return;
  }

  if (password === "adso3064975") {
    localStorage.setItem("usuario", usuario);

    document.getElementById("nombreUsuario").textContent = usuario;
    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";

    document.getElementById("navbarUser").classList.remove("d-none");
    document.getElementById("btnLogout").classList.remove("d-none");

    cargarFichas();
  } else {
    alert("Usuario o contraseña incorrectos. Inténtalo de nuevo.");
  }
}

// --- CARGAR FICHAS ---
async function cargarFichas() {
  const input = document.getElementById("selectFicha");
  const lista = document.getElementById("listaFichas");

  input.value = "";
  input.placeholder = "Cargando fichas…";
  input.disabled = true;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const raw = await response.json();
    const datos = Array.isArray(raw)
      ? raw.map((r) => ({
          codigoFicha: r.FICHA,
          nombrePrograma: r.PROGRAMA,
          nivelFormacion: r.NIVEL_DE_FORMACION,
          estadoFicha: r.ESTADO_FICHA,
          tipoDocumento: r.TIPO_DOCUMENTO,
          numeroDocumento: r.NUMERO_DOCUMENTO,
          nombre: r.NOMBRE,
          primerApellido: r.PRIMER_APELLIDO,
          segundoApellido: r.SEGUNDO_APELLIDO,
          estadoAprendiz: r.ESTADO_APRENDIZ,
        }))
      : [];

    const fichas = [...new Set(datos.map((a) => a.codigoFicha).filter(Boolean))];
    window.datos = datos;

    lista.innerHTML = "";
    fichas.forEach((f) => {
      const opt = document.createElement("option");
      opt.value = f;
      lista.appendChild(opt);
    });

    input.disabled = false;
    input.placeholder = fichas.length
      ? "Escribe o selecciona una ficha"
      : "No hay fichas disponibles";
  } catch (err) {
    console.error("Error cargando fichas:", err);
    alert("No pudimos cargar las fichas. Revisa tu conexión e inténtalo nuevamente.");
    input.disabled = false;
    input.placeholder = "Error al cargar fichas";
  }
}

// --- MOSTRAR FICHA ---
function mostrarFicha() {
  const codigo = document.getElementById("selectFicha").value.trim();

  if (!codigo) {
    alert("Por favor selecciona o escribe una ficha.");
    return;
  }

  const aprendices = window.datos.filter((a) => String(a.codigoFicha) === String(codigo));

  const tabla = document.getElementById("tablaAprendices");
  document.getElementById("conteoAprendices").textContent = aprendices.length;

  if (aprendices.length > 0) {
    document.getElementById("nombrePrograma").value = aprendices[0].nombrePrograma;

    tabla.innerHTML = `
      <thead class="table-dark">
        <tr>
          <th>Tipo de documento</th>
          <th>Número de documento</th>
          <th>Nombre</th>
          <th>Primer apellido</th>
          <th>Segundo apellido</th>
          <th>Estado del aprendiz</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = tabla.querySelector("tbody");

    const estadoClase = (estado) => {
      const key = String(estado || "").toLowerCase();
      if (key.includes("cancel")) return "estado estado-cancelado";
      if (key.includes("retiro")) return "estado estado-retiro";
      return "estado estado-formacion";
    };

    aprendices.forEach((a) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${a.tipoDocumento}</td>
        <td>${a.numeroDocumento}</td>
        <td>${a.nombre}</td>
        <td>${a.primerApellido}</td>
        <td>${a.segundoApellido}</td>
        <td><span class="${estadoClase(a.estadoAprendiz)}">${a.estadoAprendiz}</span></td>
      `;
      if (a.estadoAprendiz === "Retiro Voluntario") {
        row.classList.add("retiro");
      }
      tbody.appendChild(row);
    });
  } else {
    tabla.innerHTML = `
      <thead class="table-dark">
        <tr>
          <th>Tipo de documento</th>
          <th>Número de documento</th>
          <th>Nombre</th>
          <th>Primer apellido</th>
          <th>Segundo apellido</th>
          <th>Estado del aprendiz</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="6" class="text-center">No hay aprendices para esta ficha.</td>
        </tr>
      </tbody>
    `;
  }
}

// --- DOM READY ---
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("login");
  root.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height:70vh;">
      <div class="p-4 border rounded bg-white shadow-sm" style="width:100%;max-width:320px;">
        <h5 class="mb-3 text-center">Iniciar sesión</h5>
        
        <div class="mb-3">
          <input type="text" id="usuario" class="form-control" placeholder="Usuario">
        </div>
        
        <div class="mb-3">
          <input type="password" id="password" class="form-control" placeholder="Contraseña">
        </div>
        
        <button class="btn btn-dark w-100" id="btnIngresar">Ingresar</button>
      </div>
    </div>
  `;

  // Eventos
  document.getElementById("btnIngresar").addEventListener("click", login);
  document.getElementById("password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") login();
  });
});
