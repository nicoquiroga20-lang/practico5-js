const API_URL = "http://127.0.0.1:8000/"
//botones
const btnCatalogo = document.getElementById("btn-catalogo")
const btnFavoritos = document.getElementById("btn-favoritos")
const btnAdmin = document.getElementById("btn-admin")
//vistas
const vistaCatalogo = document.getElementById("vista-catalogo")
const vistaFavoritos = document.getElementById("vista-favoritos")
const vistaAdmin = document.getElementById("vista-admin")
//ver detalle
const modalDetalle = document.getElementById("modal-detalle")
const btnCerrarModal = document.getElementById("btn-cerrar-modal")
// ========== R1: GET ==========
function cambiarVista(vistaActiva){
    vistaCatalogo.classList.add("hidden")
    vistaFavoritos.classList.add("hidden")
    vistaAdmin.classList.add("hidden")

    vistaActiva.classList.remove("hidden") 
    vistaActiva.classList.add("block")
}
btnCatalogo.addEventListener("click", () => {cambiarVista(vistaCatalogo)})
btnFavoritos.addEventListener("click", () => {cambiarVista(vistaFavoritos)})
btnAdmin.addEventListener("click", () => {cambiarVista(vistaAdmin)})

async function estructuraCards(){
    const contenedor = document.getElementById("grid-articulos")
    contenedor.innerHTML = ''

    const articulos = await getArticulos()

    articulos.forEach(articulo => {
        if(!articulo.activo) return;

        const card = document.createElement('div')
        card.className = 'bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between text-left hover:shadow-md transition-shadow'
        card.innerHTML =
            `
                <div>
                    <h3 class="text-lg font-bold text-gray-800">${articulo.nombre_articulo}</h3>
                    <p class="text-xl font-medium text-gray-900 mt-2">$${articulo.precio.toLocaleString('es-AR')}</p>
                </div>
                <div class="mt-6 flex gap-3">
                    <button onclick="getArticuloPorId(${articulo.id})" class="flex-1 bg-gray-900 text-white py-2 px-4 rounded text-sm hover:bg-gray-700 transition-colors"> 
                        Ver detalle
                    </button>
                    <button class="px-3 py-2 border border-gray-300 rounded text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors">
                        ♥
                    </button>
                </div>
            `
        contenedor.appendChild(card)
    });
}

async function getArticulos() {
    try {
        const response = await fetch(`${API_URL}articulos/`)
        const data = await response.json()
        return data;
    } catch (error) {
        console.error("Error al traer articulo:", error)
        return []
    }
}

function ventanaDeDetalle(articulo) {
    const modal = document.getElementById("modal-detalle")
    contenidoModal = modal.querySelector(".bg-white")
    
    contenidoModal.innerHTML = `
        <h3 class="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">${articulo.nombre_articulo}</h3>
        <div class="space-y-3 text-left">
            <p class="text-sm text-gray-500"><span class="font-semibold text-gray-700">ID:</span> #${articulo.id}</p>
            <p class="text-lg text-gray-800"><span class="font-semibold text-gray-700">Precio:</span> $${articulo.precio.toLocaleString('es-AR')}</p>
            <p class="text-sm text-gray-500">
                <span class="font-semibold text-gray-700">Estado:</span> 
                <span class="${articulo.activo ? 'text-green-600' : 'text-red-600'} font-medium">
                    ${articulo.activo ? 'Activo' : 'Inactivo'}
                </span>
            </p>
        </div>
        <div class="mt-6 text-right border-t pt-4">
            <button id="btn-cerrar-modal" class="text-sm underline text-gray-600 hover:text-gray-900">Cerrar</button>
        </div>
    `;

    modal.classList.remove("hidden")

    document.getElementById("btn-cerrar-modal").addEventListener("click", () => {
        modal.classList.add("hidden")
    });
}

document.addEventListener('DOMContentLoaded', () => {
    estructuraCards()
})


async function getArticuloPorId(id) {
    try {
        const response = await fetch(`${API_URL}articulos/${id}`)

        const articulo = await response.json()
        ventanaDeDetalle(articulo)
        
    } catch (error) {
        console.error(`Error al traer el detalle del ID ${id}:`, error)
    }
}

// ========== R3: favoritos (localStorage) ==========

const CLAVE_FAVORITOS = "favoritos-god-gaming"

function obtenerFavoritos() {
    const datos = localStorage.getItem(CLAVE_FAVORITOS)
    return datos ? JSON.parse(datos) : []
}

function guardarFavoritos(lista) {
    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(lista))
}

function esFavorito(id) {
    return obtenerFavoritos().some(item => item.id === id)
}

function toggleFavorito(articulo) {
    let favoritos = obtenerFavoritos()
    if (esFavorito(articulo.id)) {
        favoritos = favoritos.filter(item => item.id !== articulo.id)
    } else {
        favoritos.push(articulo)
    }
    guardarFavoritos(favoritos)
}

async function ponerEventosFavoritos() {
    const articulos = (await getArticulos()).filter(a => a.activo)
    const cards = document.querySelectorAll("#grid-articulos > div")

    cards.forEach((card, index) => {
        const articulo = articulos[index]
        const btnFav = card.querySelectorAll("button")[1]
        btnFav.addEventListener("click", () => {
            toggleFavorito(articulo)
            renderFavoritos()
        })
    })
}

function renderFavoritos() {
    const contenedor = document.getElementById("lista-favoritos")
    contenedor.innerHTML = ""
    const favoritos = obtenerFavoritos()

    if (favoritos.length === 0) {
        contenedor.innerHTML = "<p>No tenés favoritos guardados.</p>"
        return
    }

    favoritos.forEach(articulo => {
        const card = document.createElement("div")
        card.className = "bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-left"
        card.innerHTML = `
            <h3 class="text-lg font-bold">${articulo.nombre_articulo}</h3>
            <p class="text-xl mt-2">$${articulo.precio.toLocaleString("es-AR")}</p>
            <button class="btn-quitar-fav px-3 py-2 border border-gray-300 rounded text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors mt-4">♥</button>
        `
        card.querySelector(".btn-quitar-fav").addEventListener("click", () => {
            toggleFavorito(articulo)
            renderFavoritos()
        })
        contenedor.appendChild(card)
    })
}

btnFavoritos.addEventListener("click", renderFavoritos)

// ========== R2: admin (POST, PUT, DELETE) ==========

async function crearArticulo(nuevoArticulo) {
    try {
        const response = await fetch(`${API_URL}articulos/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoArticulo)
        })
        console.log("POST:", await response.json())
        await estructuraCards()
        await ponerEventosFavoritos()
    } catch (error) {
        console.error("Error al crear:", error)
    }
}

async function editarArticulo(datos, id) {
    try {
        const response = await fetch(`${API_URL}articulos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        console.log("PUT:", await response.json())
        await estructuraCards()
        await ponerEventosFavoritos()
    } catch (error) {
        console.error("Error al editar:", error)
    }
}

async function borrarArticulo(id) {
    try {
        const response = await fetch(`${API_URL}articulos/${id}`, { method: "DELETE" })
        console.log("DELETE:", await response.json())
        await estructuraCards()
        await ponerEventosFavoritos()
    } catch (error) {
        console.error("Error al borrar:", error)
    }
}

async function buscarPorId() {
    const id = document.getElementById("buscar-id").value
    if (!id) { alert("Ingresá un ID"); return }

    try {
        const response = await fetch(`${API_URL}articulos/${id}`)
        const articulo = await response.json()

        document.getElementById("edit-id").value = articulo.id
        document.getElementById("edit-nombre").value = articulo.nombre_articulo
        document.getElementById("edit-precio").value = articulo.precio
    } catch (error) {
        console.error("Error al buscar artículo:", error)
        alert("Artículo no encontrado")
    }
}

function borrarDesdeBusqueda() {
    const id = document.getElementById("buscar-id").value
    if (!id) { alert("Ingresá un ID"); return }
    if (confirm(`¿Borrar artículo ${id}?`)) borrarArticulo(id)
}

function armarPanelAdmin() {
    const contenedor = document.getElementById("form-articulo").parentElement
    if (document.getElementById("form-crear")) return

    contenedor.innerHTML = `
        <h2 class="text-2xl mb-6">Gestión de Inventario</h2>
        <form id="form-crear" class="bg-white p-6 shadow-sm rounded mb-8 text-left space-y-2">
            <input type="number" id="id" placeholder="ID" class="w-full border rounded px-3 py-2" required>
            <input type="text" id="nombre" placeholder="Nombre" class="w-full border rounded px-3 py-2" required>
            <input type="number" id="precio" placeholder="Precio" step="0.01" class="w-full border rounded px-3 py-2" required>
            <label class="flex gap-2 text-sm"><input type="checkbox" id="activo" checked> Activo</label>
            <button type="submit" class="bg-black text-white px-4 py-2 rounded">Guardar Artículo</button>
        </form>
        <div class="bg-white p-6 shadow-sm rounded mb-8 text-left space-y-2">
            <input type="number" id="buscar-id" placeholder="ID a buscar" class="w-full border rounded px-3 py-2">
            <button type="button" id="btn-buscar" class="border px-3 py-2 rounded mr-2">Buscar</button>
            <button type="button" id="btn-borrar" class="border border-red-500 text-red-500 px-3 py-2 rounded">Borrar</button>
            <form id="form-editar" class="space-y-2 mt-4">
                <input type="hidden" id="edit-id">
                <input type="text" id="edit-nombre" placeholder="Nombre" class="w-full border rounded px-3 py-2" required>
                <input type="number" id="edit-precio" placeholder="Precio" step="0.01" class="w-full border rounded px-3 py-2" required>
                <button type="submit" class="border border-orange-500 text-orange-500 px-4 py-2 rounded">Guardar Cambios</button>
            </form>
        </div>
    `

    document.getElementById("form-crear").addEventListener("submit", (e) => {
        e.preventDefault()
        crearArticulo({
            id: parseInt(document.getElementById("id").value),
            nombre_articulo: document.getElementById("nombre").value,
            precio: parseFloat(document.getElementById("precio").value),
            activo: document.getElementById("activo").checked
        })
    })

    document.getElementById("form-editar").addEventListener("submit", (e) => {
        e.preventDefault()
        const id = parseInt(document.getElementById("edit-id").value)
        editarArticulo({
            nombre_articulo: document.getElementById("edit-nombre").value,
            precio: parseFloat(document.getElementById("edit-precio").value)
        }, id)
    })

    document.getElementById("btn-buscar").addEventListener("click", buscarPorId)
    document.getElementById("btn-borrar").addEventListener("click", borrarDesdeBusqueda)
}

btnAdmin.addEventListener("click", armarPanelAdmin)

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => ponerEventosFavoritos(), 500)
})
