# Manager Library - Frontend Application (React 18 + Vite + TypeScript)

> **Sistema de Gestión Bibliotecaria para el SENA ADSO Ficha 3413974**  
> **Desarrollador:** Juan Pablo Doria ([`@Doritotes444`](https://github.com/Doritotes444))  
> **Metodología:** Spec-Driven Development (SDD) &bull; React 18 &bull; Tailwind CSS &bull; Vite  

---

## 🚀 Descripción del Proyecto

Aplicación web Single Page Application (SPA) desarrollada en **React 18 con TypeScript y Tailwind CSS**, conectada a la API RESTful de Laravel 11 (`/api/v1`). Implementa el 100% de los requerimientos y reglas de negocio descritas en la especificación formal del proyecto Manager Library.

---

## 📱 Módulos y Pantallas Implementadas

1. **Autenticación y Seguridad (`/login`)**
   - Manejo de sesiones mediante tokens JWT (HS256).
   - Acceso rápido con credenciales de prueba para el evaluador:
     - Administrador: `admin` / `admin123`
     - Bibliotecario: `librarian` / `librarian123`
   - Control de roles estricto: vistas administrativas exclusivas (`Reportes`, `Personal`).

2. **Tablero Principal / Dashboard (`/dashboard`)**
   - Métricas en vivo (KPIs): Títulos en catálogo, total de ejemplares, socios afiliados, préstamos activos y préstamos en mora.
   - Banners de alerta automática ante vencimientos (Regla RN-02).
   - Tabla de circulación reciente con badges de estado reactivos.

3. **Catálogo de Libros (`/books`)**
   - Buscador por título, autor o código ISBN-13.
   - Filtro por categoría (Novela, Ciencia, Tecnología, Historia, Infantil) y toggle de stock disponible.
   - Visualización de carátulas con imagen por defecto.
   - **Administrador:** Formulario modal para alta de libros (título, autor, ISBN-13, categoría, stock total, carátula opcional).
   - **Administrador:** Modificación de ejemplares y baja lógica (*Soft Delete*). Si el libro tiene préstamos activos abiertos, la API bloquea la acción arrojando `409 Conflict`.

4. **Socios Afiliados (`/members`)**
   - Registro de socios con nombre, tipo de documento (CC, TI, CE, PAS), número de documento, correo y teléfono.
   - Contador en tiempo real de libros en poder del socio (máximo 3).
   - Indicador de estado: *Habilitado*, *Cupo Lleno (3/3)* o *Mora (Bloqueado)*.

5. **Terminal de Préstamos (`/loans`)**
   - Selección de socio con validación previa de cupo y morosidad.
   - Selección de 1 a 3 libros por operación con chequeo de stock y regla de no duplicados (RN-05).
   - Previsualización automática de fecha límite de devolución a 14 días calendario (RN-06).
   - Listado de préstamos con filtros por estado: `open`, `overdue`, `closed`.

6. **Módulo de Devoluciones (`/returns`)**
   - Búsqueda por documento del socio o código de préstamo.
   - Devolución individual línea por línea (*line-by-line return*).
   - Reincorporación inmediata de ejemplares al stock disponible del catálogo (RN-04).

7. **Monitor de Mora (`/overdue`)**
   - Vista especializada para el control de socios que adeudan libros superados los 14 días.
   - Explicación de la sanción según RN-02 (bloqueo total para nuevos préstamos).
   - Acciones de devolución expedita.

8. **Reportes y Analítica (`/reports`) [Solo Administrador]**
   - Ranking de los libros más prestados (Top 10) calculado por agregación directa en base de datos.
   - Podio visual de los tres títulos más leídos.
   - Barras de popularidad relativa.

9. **Gestión de Personal (`/users`) [Solo Administrador]**
   - Creación de nuevos usuarios con rol de bibliotecario y almacenamiento seguro en Argon2id.

---

## 🛠️ Tecnologías y Librerías

- **Framework:** React 18.3
- **Build Tool:** Vite 5.4
- **Lenguaje:** TypeScript 5.6
- **Estilos:** Tailwind CSS 3.4
- **Iconografía:** Lucide React
- **Servidor de Producción:** Nginx Alpine (Multi-stage build)

---

## 🐳 Ejecución con Docker

```bash
# Construir la imagen del frontend y correr en el puerto 8080
docker build -t manager-library-app .
docker run -p 8080:80 manager-library-app
```

---

## 💻 Desarrollo Local

```bash
npm install
npm run dev
# Acceder a http://localhost:3000
```
