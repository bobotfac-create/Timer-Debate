# Debate Timer React

Una aplicación integral diseñada para debatientes, jueces y entrenadores, que facilita la gestión de rondas de debate, la práctica con generadores de mociones y el acceso a recursos educativos.

## Características Principales

*   **Cronómetro de Debate:**
    *   Soporte nativo para formatos **WSDC** (World Schools Debating Championship) y **BP** (British Parliamentary).
    *   **Modo Personalizado** para configurar tiempos de discurso a medida (Función Pro).
    *   Señales visuales y auditivas (campanas) configurables para tiempos protegidos y finalización.
    *   Opciones avanzadas de sonido (subir audio personalizado).

*   **Generador de Mociones:**
    *   Base de datos extensa de mociones de debate.
    *   Filtros por tema (categoría), tipo y dificultad.
    *   Generador de mociones aleatorias para práctica improvisada.
    *   Búsqueda por palabras clave.

*   **Enciclopedia de Debate:**
    *   Recurso educativo con conceptos clave de teoría del debate.
    *   Búsqueda y navegación por categorías (ej. Argumentación, Refutación, Fiat).
    *   Explicaciones detalladas de términos técnicos.

*   **Torneos:**
    *   Sección dedicada para visualizar y gestionar torneos (Función Pro).

*   **Autenticación y Perfiles:**
    *   Gestión de usuarios segura mediante **Clerk**.
    *   Niveles de acceso (Invitado vs. Pro) que desbloquean funcionalidades avanzadas.

*   **Personalización:**
    *   Interfaz moderna en modo oscuro.
    *   Configuración de sonidos de campana (real, digital, personalizado).

## Tecnologías Utilizadas

*   **Frontend:** React 19, TypeScript, Vite
*   **Estilos:** Tailwind CSS
*   **Autenticación:** Clerk (@clerk/clerk-react)
*   **Iconos:** Lucide React
*   **Gestión de Estado:** React Hooks (Context API)

## Instalación y Configuración

### Prerrequisitos

*   Node.js (v18 o superior recomendado)
*   npm

### Pasos para iniciar

1.  Clona el repositorio:
    ```bash
    git clone <url-del-repositorio>
    cd debate-timer-react
    ```

2.  Instala las dependencias:
    ```bash
    npm install
    ```

3.  Configura las Variables de Entorno:
    Crea un archivo `.env` en la raíz del proyecto y añade tu clave pública de Clerk:
    ```env
    VITE_CLERK_PUBLISHABLE_KEY=tu_clave_publica_de_clerk
    ```

4.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```

## Estructura del Proyecto

La aplicación sigue una arquitectura modular dentro de `src/modules`:

*   `src/modules/auth`: Gestión de autenticación y contexto de usuario.
*   `src/modules/timer`: Lógica central del cronómetro, gestión de tiempos y audio.
*   `src/modules/format`: Selección de formatos de debate (WSDC, BP, Custom).
*   `src/modules/generator`: Lógica y UI para el generador de mociones.
*   `src/modules/encyclopedia`: Base de datos y visualización de conceptos de debate.
*   `src/modules/tournaments`: Gestión de torneos.
*   `src/modules/shared`: Componentes y utilidades compartidas.
*   `src/components`: Componentes de UI reutilizables.

## Resumen de Funcionalidad

La aplicación actúa como un asistente digital para la práctica y competencia de debate. Su núcleo es el **Cronómetro**, que automatiza la compleja gestión del tiempo en debates formales (señalando minutos protegidos y finales). Alrededor de este núcleo, se construyen herramientas de entrenamiento: el **Generador de Mociones** permite a los usuarios practicar la improvisación y el análisis de temas variados, mientras que la **Enciclopedia** sirve como referencia rápida para dudas teóricas. La integración con **Clerk** permite personalizar la experiencia y restringir el acceso a herramientas avanzadas para usuarios premium.
