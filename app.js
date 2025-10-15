"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class CarritoCompras {
    constructor() {
        this.items = [];
        this.cargarCarrito();
    }
    agregarProducto(producto) {
        const itemExistente = this.items.find(item => item.producto.id === producto.id);
        if (itemExistente) {
            itemExistente.cantidad++;
        }
        else {
            this.items.push({
                producto: producto,
                cantidad: 1
            });
        }
        this.guardarCarrito();
        this.actualizarVistaCarrito();
    }
    eliminarProducto(idProducto) {
        this.items = this.items.filter(item => item.producto.id !== idProducto);
        this.guardarCarrito();
        this.actualizarVistaCarrito();
    }
    aumentarCantidad(idProducto) {
        const item = this.items.find(item => item.producto.id === idProducto);
        if (item) {
            item.cantidad++;
            this.guardarCarrito();
            this.actualizarVistaCarrito();
        }
    }
    disminuirCantidad(idProducto) {
        const item = this.items.find(item => item.producto.id === idProducto);
        if (item) {
            if (item.cantidad > 1) {
                item.cantidad--;
            }
            else {
                this.eliminarProducto(idProducto);
                return;
            }
            this.guardarCarrito();
            this.actualizarVistaCarrito();
        }
    }
    calcularTotal() {
        let total = 0;
        this.items.forEach(item => {
            total += item.producto.precio * item.cantidad;
        });
        return total;
    }
    obtenerCantidadTotal() {
        let cantidad = 0;
        this.items.forEach(item => {
            cantidad += item.cantidad;
        });
        return cantidad;
    }
    vaciarCarrito() {
        this.items = [];
        this.guardarCarrito();
        this.actualizarVistaCarrito();
    }
    guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(this.items));
    }
    cargarCarrito() {
        const carritoGuardado = localStorage.getItem('carrito');
        if (carritoGuardado) {
            this.items = JSON.parse(carritoGuardado);
        }
    }
    actualizarVistaCarrito() {
        const cantidadCarrito = document.getElementById('cantidadCarrito');
        cantidadCarrito.textContent = this.obtenerCantidadTotal().toString();
        const listaCarrito = document.getElementById('listaCarrito');
        const totalCarrito = document.getElementById('totalCarrito');
        if (this.items.length === 0) {
            listaCarrito.innerHTML = '<div class="carrito-vacio"><p>Tu carrito está vacío 😢</p></div>';
            totalCarrito.textContent = '0.00';
        }
        else {
            listaCarrito.innerHTML = '';
            this.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'carrito-item';
                itemDiv.innerHTML = `
                    <img src="${item.producto.imagen}" alt="${item.producto.nombre}">
                    <div class="carrito-item-info">
                        <h4>${item.producto.nombre}</h4>
                        <p>${item.producto.consola}</p>
                        <p class="precio">$${item.producto.precio.toFixed(2)} MXN</p>
                    </div>
                    <div class="carrito-item-cantidad">
                        <button class="btn-cantidad" onclick="disminuirCantidad(${item.producto.id})">-</button>
                        <span>${item.cantidad}</span>
                        <button class="btn-cantidad" onclick="aumentarCantidad(${item.producto.id})">+</button>
                    </div>
                    <button class="btn-danger" onclick="eliminarDelCarrito(${item.producto.id})">Eliminar</button>
                `;
                listaCarrito.appendChild(itemDiv);
            });
            totalCarrito.textContent = this.calcularTotal().toFixed(2);
        }
    }
}
let carritoActual = new CarritoCompras();
let usuarioActual = null;
let catalogoProductos = [];
function cargarSesion() {
    const sesionGuardada = localStorage.getItem('usuario');
    if (sesionGuardada) {
        usuarioActual = JSON.parse(sesionGuardada);
        actualizarInterfazUsuario();
    }
}
function guardarSesion(usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
}
function cerrarSesion() {
    usuarioActual = null;
    localStorage.removeItem('usuario');
    actualizarInterfazUsuario();
    alert('Sesión cerrada correctamente');
}
function actualizarInterfazUsuario() {
    const userSection = document.getElementById('userSection');
    if (usuarioActual) {
        userSection.innerHTML = `
            <div id="userInfo">
                <span>Hola, ${usuarioActual.nombre} 👋</span>
                <button id="btnCerrarSesion" class="btn-secondary">Cerrar Sesión</button>
            </div>
        `;
        const btnCerrarSesion = document.getElementById('btnCerrarSesion');
        btnCerrarSesion === null || btnCerrarSesion === void 0 ? void 0 : btnCerrarSesion.addEventListener('click', cerrarSesion);
    }
    else {
        userSection.innerHTML = `
            <button id="btnLogin" class="btn-secondary">Iniciar Sesión</button>
            <button id="btnRegister" class="btn-secondary">Registrarse</button>
        `;
        setTimeout(() => {
            configurarEventosBotones();
        }, 100);
    }
}
function registrarUsuario(nombre, email, password) {
    const usuariosGuardados = localStorage.getItem('usuarios');
    let usuarios = usuariosGuardados ? JSON.parse(usuariosGuardados) : [];
    const usuarioExiste = usuarios.find(u => u.email === email);
    if (usuarioExiste) {
        alert('Este email ya está registrado');
        return;
    }
    const nuevoUsuario = {
        nombre: nombre,
        email: email,
        password: password
    };
    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    alert('¡Usuario registrado correctamente! Ahora puedes iniciar sesión');
    cerrarModal('modalRegister');
    const form = document.getElementById('formRegister');
    form.reset();
}
function iniciarSesion(email, password) {
    const usuariosGuardados = localStorage.getItem('usuarios');
    if (!usuariosGuardados) {
        alert('No hay usuarios registrados');
        return;
    }
    const usuarios = JSON.parse(usuariosGuardados);
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    if (usuario) {
        usuarioActual = usuario;
        guardarSesion(usuario);
        actualizarInterfazUsuario();
        cerrarModal('modalLogin');
        alert(`¡Bienvenido ${usuario.nombre}!`);
        const form = document.getElementById('formLogin');
        form.reset();
    }
    else {
        alert('Email o contraseña incorrectos');
    }
}
function cargarCatalogo() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('productos.json');
            catalogoProductos = yield response.json();
            mostrarCatalogo();
        }
        catch (error) {
            console.error('Error al cargar el catálogo:', error);
            alert('No se pudo cargar el catálogo de productos');
        }
    });
}
function mostrarCatalogo() {
    const catalogoDiv = document.getElementById('catalogo');
    catalogoDiv.innerHTML = '';
    catalogoProductos.forEach(producto => {
        const productoCard = document.createElement('div');
        productoCard.className = 'producto-card';
        productoCard.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p class="consola">${producto.consola}</p>
            <p class="precio">$${producto.precio.toFixed(2)} MXN</p>
            <button class="btn-primary" onclick="agregarAlCarrito(${producto.id})">
                Agregar al Carrito
            </button>
        `;
        catalogoDiv.appendChild(productoCard);
    });
}
function agregarAlCarrito(idProducto) {
    const producto = catalogoProductos.find(p => p.id === idProducto);
    if (producto) {
        carritoActual.agregarProducto(producto);
        alert(`${producto.nombre} agregado al carrito!`);
    }
}
function eliminarDelCarrito(idProducto) {
    carritoActual.eliminarProducto(idProducto);
}
function aumentarCantidad(idProducto) {
    carritoActual.aumentarCantidad(idProducto);
}
function disminuirCantidad(idProducto) {
    carritoActual.disminuirCantidad(idProducto);
}
function realizarCompra() {
    if (!usuarioActual) {
        alert('Debes iniciar sesión para realizar una compra');
        cerrarModal('modalCarrito');
        abrirModal('modalLogin');
        return;
    }
    if (carritoActual.items.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    const total = carritoActual.calcularTotal();
    alert(`¡Compra realizada con éxito!\nTotal: $${total.toFixed(2)} MXN\n¡Gracias por tu compra, ${usuarioActual.nombre}!`);
    carritoActual.vaciarCarrito();
    cerrarModal('modalCarrito');
}
function abrirModal(idModal) {
    const modal = document.getElementById(idModal);
    modal.style.display = 'block';
}
function cerrarModal(idModal) {
    const modal = document.getElementById(idModal);
    modal.style.display = 'none';
}
function configurarEventosBotones() {
    const btnLogin = document.getElementById('btnLogin');
    const btnRegister = document.getElementById('btnRegister');
    const btnCarrito = document.getElementById('btnCarrito');
    btnLogin === null || btnLogin === void 0 ? void 0 : btnLogin.addEventListener('click', () => abrirModal('modalLogin'));
    btnRegister === null || btnRegister === void 0 ? void 0 : btnRegister.addEventListener('click', () => abrirModal('modalRegister'));
    btnCarrito === null || btnCarrito === void 0 ? void 0 : btnCarrito.addEventListener('click', () => {
        carritoActual.actualizarVistaCarrito();
        abrirModal('modalCarrito');
    });
}
document.addEventListener('DOMContentLoaded', () => {
    cargarSesion();
    cargarCatalogo();
    carritoActual.actualizarVistaCarrito();
    configurarEventosBotones();
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target;
            const modalId = target.getAttribute('data-modal');
            if (modalId) {
                cerrarModal(modalId);
            }
        });
    });
    window.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('modal')) {
            target.style.display = 'none';
        }
    });
    const formLogin = document.getElementById('formLogin');
    formLogin === null || formLogin === void 0 ? void 0 : formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        iniciarSesion(email, password);
    });
    const formRegister = document.getElementById('formRegister');
    formRegister === null || formRegister === void 0 ? void 0 : formRegister.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('registerNombre').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        registrarUsuario(nombre, email, password);
    });
    const btnComprar = document.getElementById('btnComprar');
    btnComprar === null || btnComprar === void 0 ? void 0 : btnComprar.addEventListener('click', realizarCompra);
    const linkRegistro = document.getElementById('linkRegistro');
    const linkLogin = document.getElementById('linkLogin');
    linkRegistro === null || linkRegistro === void 0 ? void 0 : linkRegistro.addEventListener('click', (e) => {
        e.preventDefault();
        cerrarModal('modalLogin');
        abrirModal('modalRegister');
    });
    linkLogin === null || linkLogin === void 0 ? void 0 : linkLogin.addEventListener('click', (e) => {
        e.preventDefault();
        cerrarModal('modalRegister');
        abrirModal('modalLogin');
    });
});
window.agregarAlCarrito = agregarAlCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
window.aumentarCantidad = aumentarCantidad;
window.disminuirCantidad = disminuirCantidad;
