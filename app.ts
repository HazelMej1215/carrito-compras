interface Producto {
    id: number;
    nombre: string;
    precio: number;
    imagen: string;
    consola: string;
}

interface ItemCarrito {
    producto: Producto;
    cantidad: number;
}

interface Usuario {
    nombre: string;
    email: string;
    password: string;
}

type SesionUsuario = Usuario | null;

class CarritoCompras {
    items: ItemCarrito[];

    constructor() {
        this.items = [];
        this.cargarCarrito();
    }

    agregarProducto(producto: Producto) {
        const itemExistente = this.items.find(item => item.producto.id === producto.id);

        if (itemExistente) {
            itemExistente.cantidad++;
        } else {
            this.items.push({
                producto: producto,
                cantidad: 1
            });
        }

        this.guardarCarrito();
        this.actualizarVistaCarrito();
    }

    eliminarProducto(idProducto: number) {
        this.items = this.items.filter(item => item.producto.id !== idProducto);
        this.guardarCarrito();
        this.actualizarVistaCarrito();
    }

    aumentarCantidad(idProducto: number) {
        const item = this.items.find(item => item.producto.id === idProducto);
        if (item) {
            item.cantidad++;
            this.guardarCarrito();
            this.actualizarVistaCarrito();
        }
    }

    disminuirCantidad(idProducto: number) {
        const item = this.items.find(item => item.producto.id === idProducto);
        if (item) {
            if (item.cantidad > 1) {
                item.cantidad--;
            } else {
                this.eliminarProducto(idProducto);
                return;
            }
            this.guardarCarrito();
            this.actualizarVistaCarrito();
        }
    }

    calcularTotal(): number {
        let total = 0;
        this.items.forEach(item => {
            total += item.producto.precio * item.cantidad;
        });
        return total;
    }

    obtenerCantidadTotal(): number {
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
        const cantidadCarrito = document.getElementById('cantidadCarrito') as HTMLElement;
        cantidadCarrito.textContent = this.obtenerCantidadTotal().toString();
        const listaCarrito = document.getElementById('listaCarrito') as HTMLElement;
        const totalCarrito = document.getElementById('totalCarrito') as HTMLElement;

        if (this.items.length === 0) {
            listaCarrito.innerHTML = '<div class="carrito-vacio"><p>Tu carrito está vacío 😢</p></div>';
            totalCarrito.textContent = '0.00';
        } else {
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
let usuarioActual: SesionUsuario = null;
let catalogoProductos: Producto[] = [];

function cargarSesion() {
    const sesionGuardada = localStorage.getItem('usuario');
    if (sesionGuardada) {
        usuarioActual = JSON.parse(sesionGuardada);
        actualizarInterfazUsuario();
    }
}

function guardarSesion(usuario: Usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
}

function cerrarSesion() {
    usuarioActual = null;
    localStorage.removeItem('usuario');
    actualizarInterfazUsuario();
    alert('Sesión cerrada correctamente');
}

function actualizarInterfazUsuario() {
    const userSection = document.getElementById('userSection') as HTMLElement;

    if (usuarioActual) {
        userSection.innerHTML = `
            <div id="userInfo">
                <span>Hola, ${usuarioActual.nombre} 👋</span>
                <button id="btnCerrarSesion" class="btn-secondary">Cerrar Sesión</button>
            </div>
        `;

        const btnCerrarSesion = document.getElementById('btnCerrarSesion');
        btnCerrarSesion?.addEventListener('click', cerrarSesion);
    } else {
        userSection.innerHTML = `
            <button id="btnLogin" class="btn-secondary">Iniciar Sesión</button>
            <button id="btnRegister" class="btn-secondary">Registrarse</button>
        `;

        setTimeout(() => {
            configurarEventosBotones();
        }, 100);
    }
}

function registrarUsuario(nombre: string, email: string, password: string) {
    const usuariosGuardados = localStorage.getItem('usuarios');
    let usuarios: Usuario[] = usuariosGuardados ? JSON.parse(usuariosGuardados) : [];

    const usuarioExiste = usuarios.find(u => u.email === email);
    if (usuarioExiste) {
        alert('Este email ya está registrado');
        return;
    }

    const nuevoUsuario: Usuario = {
        nombre: nombre,
        email: email,
        password: password
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    alert('¡Usuario registrado correctamente! Ahora puedes iniciar sesión');
    cerrarModal('modalRegister');
    const form = document.getElementById('formRegister') as HTMLFormElement;
    form.reset();
}

function iniciarSesion(email: string, password: string) {
    const usuariosGuardados = localStorage.getItem('usuarios');
    if (!usuariosGuardados) {
        alert('No hay usuarios registrados');
        return;
    }

    const usuarios: Usuario[] = JSON.parse(usuariosGuardados);
    const usuario = usuarios.find(u => u.email === email && u.password === password);

    if (usuario) {
        usuarioActual = usuario;
        guardarSesion(usuario);
        actualizarInterfazUsuario();
        cerrarModal('modalLogin');
        alert(`¡Bienvenido ${usuario.nombre}!`);
        const form = document.getElementById('formLogin') as HTMLFormElement;
        form.reset();
    } else {
        alert('Email o contraseña incorrectos');
    }
}

async function cargarCatalogo() {
    try {
        const response = await fetch('productos.json');
        catalogoProductos = await response.json();
        mostrarCatalogo();
    } catch (error) {
        console.error('Error al cargar el catálogo:', error);
        alert('No se pudo cargar el catálogo de productos');
    }
}

function mostrarCatalogo() {
    const catalogoDiv = document.getElementById('catalogo') as HTMLElement;
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

function agregarAlCarrito(idProducto: number) {
    const producto = catalogoProductos.find(p => p.id === idProducto);
    if (producto) {
        carritoActual.agregarProducto(producto);
        alert(`${producto.nombre} agregado al carrito!`);
    }
}

function eliminarDelCarrito(idProducto: number) {
    carritoActual.eliminarProducto(idProducto);
}

function aumentarCantidad(idProducto: number) {
    carritoActual.aumentarCantidad(idProducto);
}

function disminuirCantidad(idProducto: number) {
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

function abrirModal(idModal: string) {
    const modal = document.getElementById(idModal) as HTMLElement;
    modal.style.display = 'block';
}

function cerrarModal(idModal: string) {
    const modal = document.getElementById(idModal) as HTMLElement;
    modal.style.display = 'none';
}

function configurarEventosBotones() {
    const btnLogin = document.getElementById('btnLogin');
    const btnRegister = document.getElementById('btnRegister');
    const btnCarrito = document.getElementById('btnCarrito');

    btnLogin?.addEventListener('click', () => abrirModal('modalLogin'));
    btnRegister?.addEventListener('click', () => abrirModal('modalRegister'));
    btnCarrito?.addEventListener('click', () => {
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
            const target = e.target as HTMLElement;
            const modalId = target.getAttribute('data-modal');
            if (modalId) {
                cerrarModal(modalId);
            }
        });
    });

    window.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('modal')) {
            target.style.display = 'none';
        }
    });

    const formLogin = document.getElementById('formLogin') as HTMLFormElement;
    formLogin?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = (document.getElementById('loginEmail') as HTMLInputElement).value;
        const password = (document.getElementById('loginPassword') as HTMLInputElement).value;
        iniciarSesion(email, password);
    });

    const formRegister = document.getElementById('formRegister') as HTMLFormElement;
    formRegister?.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = (document.getElementById('registerNombre') as HTMLInputElement).value;
        const email = (document.getElementById('registerEmail') as HTMLInputElement).value;
        const password = (document.getElementById('registerPassword') as HTMLInputElement).value;
        registrarUsuario(nombre, email, password);
    });

    const btnComprar = document.getElementById('btnComprar');
    btnComprar?.addEventListener('click', realizarCompra);

    const linkRegistro = document.getElementById('linkRegistro');
    const linkLogin = document.getElementById('linkLogin');

    linkRegistro?.addEventListener('click', (e) => {
        e.preventDefault();
        cerrarModal('modalLogin');
        abrirModal('modalRegister');
    });

    linkLogin?.addEventListener('click', (e) => {
        e.preventDefault();
        cerrarModal('modalRegister');
        abrirModal('modalLogin');
    });
});

(window as any).agregarAlCarrito = agregarAlCarrito;
(window as any).eliminarDelCarrito = eliminarDelCarrito;
(window as any).aumentarCantidad = aumentarCantidad;
(window as any).disminuirCantidad = disminuirCantidad;