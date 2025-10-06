const url = "https://raw.githubusercontent.com/CesarMCuellarCha/apis/main/SENA-CTPI.matriculados.json";

function doLogin() {
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;
  if (!user || !pass) {
    alert("Ingresa usuario y contraseña");
    return;
  }
  if (pass === "adso3064975") {
    localStorage.setItem("user", user);
    document.getElementById("userName").textContent = user;
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("mainScreen").classList.remove("hidden");
    loadFichas();
  } else {
    alert("Contraseña incorrecta");
  }
}

function logout() {
  localStorage.removeItem("user");
  document.getElementById("mainScreen").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");
}

// Función para cargar las fichas desde el JSON remoto
async function loadFichas() {
  const select = document.getElementById("fichaSeleccionada");

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Error de red");
    const data = await response.json();

    // Procesar y guardar los datos necesarios en window.data para uso global
    window.data = data.map(item => ({
      ficha: item.FICHA,
      programa: item.PROGRAMA,
      tipoDoc: item.TIPO_DOCUMENTO,
      numDoc: item.NUMERO_DOCUMENTO,
      nombre: item.NOMBRE,
      apellido: `${item.PRIMER_APELLIDO} ${item.SEGUNDO_APELLIDO || ""}`,
      estado: item.ESTADO_APRENDIZ
    }));

    // Obtener las fichas únicas como strings para el select
    const fichas = [...new Set(window.data.map(item => String(item.ficha)))];
    select.innerHTML = "<option value=''>Selecciona una ficha</option>";

    // Agregar cada ficha al select
    fichas.forEach(f => {
      const opt = document.createElement("option");
      opt.value = f;
      opt.textContent = f;
      select.appendChild(opt);
    });

    select.disabled = false;
  } catch (e) {
    alert("Error al cargar datos");
    select.disabled = false;
  }
}

// Función para mostrar datos filtrados por ficha seleccionada
function showData() {
  const ficha = document.getElementById("fichaSeleccionada").value;
  const table = document.getElementById("tablaDeDatos");
  const program = document.getElementById("Nombreprograma");
  const count = document.getElementById("conteoAprendices");
  table.innerHTML = "<tr><th>Documento</th><th>Nombre</th><th>Apellido</th><th>Estado</th></tr>";

  // Si no hay ficha seleccionada, limpiar campos y salir
  if (!ficha) {
    program.value = "";
    count.textContent = "0";
    return;
  }

  // Filtrar aprendices que coinciden con la ficha seleccionada
  const aprendices = window.data.filter(item => String(item.ficha) === ficha);
  count.textContent = aprendices.length;
  program.value = aprendices[0]?.programa || "";

  if (aprendices.length === 0) {  // Si no hay aprendices, mostrar mensaje en tabla y salir
    table.innerHTML += "<tr><td colspan='4'>No hay datos</td></tr>";
    return;
  }

  aprendices.forEach(a => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${a.tipoDoc} ${a.numDoc}</td>
      <td>${a.nombre}</td>
      <td>${a.apellido}</td>
      <td class="${a.estado.toLowerCase().includes('retiro') ? 'error' : ''}">${a.estado}</td>
    `;

    table.appendChild(row);
  });
}