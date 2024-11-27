// Carga de sonidos para los diferentes eventos del juego
let sonido_ganador = new Audio("audios/sonido_ganador.ogg");
let sonido_win = new Audio("audios/sonido_win.ogg");
let sonido_perdedor = new Audio("audios/sonido_perdedor.ogg");
let sonido_gameover = new Audio("audios/sonido_gameover.ogg");
let sonido_descubrir = new Audio("audios/sonido_descubrir.ogg");
let sonido_juegonuevo = new Audio("audios/sonido_nuevojuego.ogg");
let sonido_abrirarea = new Audio("audios/sonido_abrirarea.ogg");
let sonido_marca = new Audio("audios/sonido_marca.ogg");

// Configuración inicial del tablero
let filas = 20; // Número de filas en el tablero
let columnas = 20; // Número de columnas en el tablero
let lado = 30; // Tamaño de cada celda (en píxeles)

// Variables para el seguimiento del juego
let marcas = 0; // Número de celdas marcadas por el jugador
let minas = filas * columnas * 0.1; // Número de minas en el tablero (10% de las celdas)

let tablero = []; // Arreglo para almacenar el estado de cada celda

let enJuego = true; // Estado del juego (si está en curso o no)
let juegoIniciado = false; // Indica si el juego ha comenzado

// Inicia un nuevo juego
nuevoJuego();

// Función que inicializa un nuevo juego
function nuevoJuego() {
  sonido_juegonuevo.play(); // Reproduce el sonido de inicio de juego
  reiniciarVariables(); // Resetea las variables del juego
  generarTableroHTML(); // Genera la estructura visual del tablero
  generarTableroJuego(); // Genera las minas y números en el tablero
  añadirEventos(); // Añade los eventos de interacción del jugador
  refrescarTablero(); // Actualiza el estado visual del tablero según la lógica del juego
}

// Función que permite ajustar las configuraciones del juego (como la dificultad, filas y columnas)
async function ajustes() {
  const { value: ajustes } = await swal.fire({
    title: "Ajustes", // Título de la ventana emergente
    html: `
            Dificultad:
            <select id="dificultad-predeterminada" onchange="actualizarValores()">
              <option value="personalizado">Personalizado</option>
              <option value="facil">Fácil</option>
              <option value="medio">Medio</option>
              <option value="dificil">Difícil</option>
            </select>
            <br><br>
            Dificultad (minas/área)
            <br>
            <input onchange="cambiarValor()" oninput="this.onchange()" id="dificultad" type="range" min="10" max="40" step="1" value="${100 * minas / (filas * columnas)}">
            <span id="valor-dificultad">${100 * minas / (filas * columnas)}%</span>
            <br>
            Filas
            <br>
            <input class="swal2-input" type="number" value=${filas} placeholder="filas" id="filas" min="10" max="1000" step="1">
            <br>
            Columnas
            <br>
            <input class="swal2-input" type="number" value=${columnas} placeholder="columnas" id="columnas" min="10" max="1000" step="1">
            `,
    confirmButtonText: "Establecer", // Texto del botón para confirmar los ajustes
    cancelButtonText: "Cancelar", // Texto del botón para cancelar los ajustes
    showCancelButton: true, // Muestra el botón de cancelar
    preConfirm: () => { // Devuelve los valores configurados por el usuario
      return {
        columnas: document.getElementById("columnas").value,
        filas: document.getElementById("filas").value,
        dificultad: document.getElementById("dificultad").value
      };
    }
  });

  // Si el usuario cancela o no hay ajustes, no hace nada
  if (!ajustes) {
    return;
  }

  // Asigna los nuevos valores a las variables del juego
  filas = Math.floor(ajustes.filas);
  columnas = Math.floor(ajustes.columnas);
  minas = Math.floor(columnas * filas * ajustes.dificultad / 100); // Calcula las minas según la dificultad
  nuevoJuego(); // Inicia un nuevo juego con los nuevos ajustes
}

// Función para actualizar los valores de filas, columnas y dificultad según la opción seleccionada
function actualizarValores() {
  const seleccion = document.getElementById("dificultad-predeterminada").value; // Obtiene la opción seleccionada

  // Ajusta los valores de filas, columnas y dificultad según la opción elegida
  switch (seleccion) {
    case "facil": // Opción fácil
      document.getElementById("filas").value = 8; // Filas = 8
      document.getElementById("columnas").value = 10; // Columnas = 10
      document.getElementById("dificultad").value = 13; // Dificultad = 13%
      break;
    case "medio": // Opción nivel medio
      document.getElementById("filas").value = 14; // Filas = 14
      document.getElementById("columnas").value = 18; // Columnas = 18
      document.getElementById("dificultad").value = 16; // Dificultad = 16%
      break;
    case "dificil": // Opción difícil
      document.getElementById("filas").value = 20; // Filas = 20
      document.getElementById("columnas").value = 24; // Columnas = 24
      document.getElementById("dificultad").value = 21; // Dificultad = 21%
      break;
    default:
      // Si la opción es "Personalizado" u otra, no cambia los valores predeterminados
      break;
  }

  // Actualizar visualización del rango de dificultad
  document.getElementById("valor-dificultad").innerText = `${document.getElementById("dificultad").value}%`;
}

// Función para reiniciar las variables del juego
function reiniciarVariables() {
  marcas = 0; // Resetea el contador de marcas
  enJuego = true; // Establece que el juego está en curso
  juegoIniciado = false; // Indica que el juego aún no ha comenzado
}

// Función para generar la estructura HTML del tablero
function generarTableroHTML() {
  let html = ""; // Variable para almacenar el HTML generado
  // Bucle que recorre las filas del tablero
  for (let f = 0; f < filas; f++) {
    html += `<tr>`; // Añade una fila al HTML
    // Bucle que recorre las columnas de cada fila
    for (let c = 0; c < columnas; c++) {
      // Añade una celda (td) con un identificador único (celda-c-f)
      html += `<td id="celda-${c}-${f}" style="width:${lado}px;height:${lado}px">`;
      html += `</td>`;
    }
    html += `</tr>`; // Cierra la fila
  }
  // Selecciona el elemento HTML con id "tablero" donde se va a insertar el HTML generado
  let tableroHTML = document.getElementById("tablero");
  tableroHTML.innerHTML = html; // Inserta el HTML generado en el elemento
  tableroHTML.style.width = columnas * lado + "px"; // Ajusta el ancho del tablero según el número de columnas
  tableroHTML.style.height = filas * lado + "px"; // Ajusta la altura del tablero según el número de filas
}

// Función para añadir eventos de interacción (doble clic y clic derecho/izquierdo) a las celdas
function añadirEventos() {
  // Bucle que recorre todas las filas
  for (let f = 0; f < filas; f++) {
    // Bucle que recorre todas las columnas
    for (let c = 0; c < columnas; c++) {
      let celda = document.getElementById(`celda-${c}-${f}`); // Selecciona la celda por su id
      // Añade el evento de doble clic a la celda
      celda.addEventListener("dblclick", function (me) {
        dobleClic(celda, c, f, me); // Llama a la función para manejar el doble clic
      });
      // Añade el evento de clic con el mouse a la celda
      celda.addEventListener("mouseup", function (me) {
        clicSimple(celda, c, f, me); // Llama a la función para manejar el clic simple
      });
    }
  }
}

// Función para manejar el doble clic en una celda
// Esta función destapa las celdas que rodean a la celda clickeada
function dobleClic(celda, c, f, me) {
  if (!enJuego) {
    return; // Si el juego ha terminado, no hace nada
  }
  abrirArea(c, f); // Llama a la función para abrir el área alrededor de la celda
  refrescarTablero(); // Actualiza el tablero visualmente
}

let tiempoInicio = 0; // Guarda el tiempo de inicio (en milisegundos)
let tiempoTranscurrido = 0; // Guarda el tiempo transcurrido en el juego (en milisegundos)
let temporizador; // Variable que guardará el setInterval para el temporizador

function actualizarTiempo() {
  tiempoTranscurrido = Math.floor((Date.now() - tiempoInicio) / 1000); // Calcula el tiempo transcurrido en segundos
  document.getElementById("contador").innerText = ` ${tiempoTranscurrido} s`; // Muestra el tiempo en un elemento HTML
}


// Función para manejar el clic simple en una celda
function clicSimple(celda, c, f, me) {
  if (!enJuego) {
    return; // Si el juego ha terminado, no hace nada
  }
  if (tablero[c][f].estado == "descubierto") {
    return; // Si la celda ya está descubierta, no hace nada
  }

  // Iniciar el contador de tiempo si es el primer clic
  if (!juegoIniciado) {
    tiempoInicio = Date.now(); // Guarda el tiempo de inicio
    temporizador = setInterval(actualizarTiempo, 1000); // Inicia el temporizador para actualizar cada segundo
    juegoIniciado = true; // Marca que el juego ha comenzado
  }

  switch (me.button) {
    case 0: // 0 es el código para el clic izquierdo
      if (tablero[c][f].estado == "marcado") { // Si la celda está marcada, no hace nada
        break;
      }
      // Evita que la primera jugada sea sobre una mina, reconfigura el tablero si es necesario
      while (!juegoIniciado && tablero[c][f].valor == -1) {
        generarTableroJuego(); // Regenera el tablero si se ha hecho clic en una mina
      }
      tablero[c][f].estado = "descubierto"; // Cambia el estado de la celda a "descubierto"
      sonido_descubrir.play(); // Reproduce el sonido de descubrir celda
      if (tablero[c][f].valor == 0) {
        // Si la celda descubierta tiene valor 0, abre todas las celdas adyacentes con valor 0
        abrirArea(c, f);
      }
      break;
    case 1: // 1 es el código para el clic medio (scroll)
      break; // No realiza ninguna acción en este caso
    case 2: // 2 es el código para el clic derecho
      // Si la celda ya está marcada, la desmarca y disminuye el contador de marcas
      if (tablero[c][f].estado == "marcado") {
        tablero[c][f].estado = undefined;
        marcas--; // Disminuye el número de marcas
        sonido_marca.play(); // Reproduce el sonido de marcar/desmarcar
      } else {
        // Si la celda no está marcada, la marca y aumenta el contador de marcas
        tablero[c][f].estado = "marcado";
        marcas++; // Aumenta el número de marcas
        sonido_marca.play(); // Reproduce el sonido de marcar/desmarcar
      }
      break;
    default:
      break; // Si se hace clic con otro botón, no hace nada
  }
  refrescarTablero(); // Actualiza el tablero visualmente
}

// Función que abre las celdas circundantes a la celda clickeada, especialmente si su valor es 0
function abrirArea(c, f) {
  // Recorre las celdas alrededor de la celda seleccionada (c, f)
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      // Si (i, j) es igual a (0, 0), significa que es la misma celda y se omite
      if (i == 0 && j == 0) {
        continue;
      }
      try { // Se usa try-catch para evitar errores si el índice está fuera del tablero
        // Si la celda no está descubierta y no está marcada, la descubrimos
        if (tablero[c + i][f + j].estado != "descubierto") {
          if (tablero[c + i][f + j].estado != "marcado") {
            tablero[c + i][f + j].estado = "descubierto"; // Abre la celda
            sonido_abrirarea.play(); // Reproduce el sonido de abrir área
            if (tablero[c + i][f + j].valor == 0) { // Si la celda abierta es 0, abre las celdas circundantes
              abrirArea(c + i, f + j);
            }
          }
        }
      } catch (e) { } // Atrapa errores si intentamos acceder a celdas fuera del rango
    }
  }
}

// Función para refrescar el estado visual del tablero según el estado lógico de las celdas
function refrescarTablero() {
  // Recorre todas las celdas del tablero
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      let celda = document.getElementById(`celda-${c}-${f}`); // Selecciona la celda correspondiente
      // Si la celda está descubierta, se actualiza su apariencia
      if (tablero[c][f].estado == "descubierto") {
        celda.style.boxShadow = "none"; // Elimina la sombra
        // Establece el fondo alternando colores para las celdas
        celda.style.background = (f + c) % 2 === 0 ? "#E5C29F" : "#D7B899";
        switch (tablero[c][f].valor) {
          case -1: // Si la celda es una mina
            celda.innerHTML = `<i class="fas fa-bomb"></i>`; // Muestra un icono de bomba
            celda.style.color = "black"; // Define el color de la bomba
            break;
          case 0: // Si la celda está vacía
            celda.innerHTML = ""; // Sin contenido visible
            break;
          default: // Si la celda tiene un número
            celda.innerHTML = tablero[c][f].valor; // Muestra el número
            celda.style.color = getColorByValue(tablero[c][f].valor); // Asigna color al número
            break;
        }
      }
      // Si la celda está marcada, muestra una bandera
      if (tablero[c][f].estado == "marcado") {
        celda.innerHTML = `<i class="fas fa-flag"></i>`; // Muestra una bandera
        celda.style.background = `cadetblue`; // Color de fondo para celdas marcadas
      }
      // Si la celda no tiene un estado definido (no marcada ni descubierta)
      if (tablero[c][f].estado == undefined) {
        celda.innerHTML = ``; // Sin contenido visible
        celda.style.background = ``; // Sin color de fondo
      }
    }
  }
  // Verifica si el jugador ha ganado o perdido
  verificarGanador();
  verificarPerdedor();
  // Actualiza el panel de minas restantes
  actualizarPanelMinas();
}

// Función que asigna un color a un número según su valor
function getColorByValue(value) {
  const colors = {
    1: "blue", // 1: Azul
    2: "green", // 2: Verde
    3: "red", // 3: Rojo
    4: "purple", // 4: Púrpura
    5: "maroon", // 5: Marrón
    6: "turquoise", // 6: Turquesa
    7: "black", // 7: Negro
    8: "gray", // 8: Gris
    9: "pink" // 9: Rosa
  };
  return colors[value] || "black"; // Si el valor no está en el mapa, devuelve negro como color predeterminado
}

// Función que actualiza el número de minas restantes que el jugador debe marcar
function actualizarPanelMinas() {
  let panel = document.getElementById("minas"); // Selecciona el panel de minas
  panel.innerHTML = minas - marcas; // Muestra la cantidad de minas restantes (total de minas - marcas realizadas)
}

// Función que verifica si el jugador ha ganado
function verificarGanador() {
  if (!enJuego) return; // Si el juego ya terminó, no hace nada

  // Recorre todas las celdas del tablero
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      // Si hay una celda que no está descubierta y no es una mina, el juego no ha terminado
      if (tablero[c][f].estado != `descubierto`) {
        if (tablero[c][f].valor == -1) {
          continue; // Si es una mina cubierta, está bien
        } else {
          return; // Si hay una celda no mina que sigue cubierta, no hemos ganado aún
        }
      }
    }
  }

  // Si todas las celdas cubiertas son minas, hemos ganado
  enJuego = false; // Cambia el estado del juego a terminado

  // Detener el temporizador cuando se gana
  clearInterval(temporizador);

  // Cambia el color de las minas a verde con una transición suave
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (tablero[c][f].valor == -1) {
        let celda = document.getElementById(`celda-${c}-${f}`);
        celda.innerHTML = `<i class="fas fa-bomb"></i>`; // Muestra la bomba
        celda.classList.add("mina-verde"); // Aplica clase para cambiar el color de la mina a verde
      }
    }
  }

  // Después de 2 segundos, cambia el color de las minas a negro
  setTimeout(() => {
    for (let f = 0; f < filas; f++) {
      for (let c = 0; c < columnas; c++) {
        if (tablero[c][f].valor == -1) {
          let celda = document.getElementById(`celda-${c}-${f}`);
          celda.classList.remove("mina-verde"); // Elimina la clase verde
          celda.classList.add("mina-negra"); // Aplica la clase negra
        }
      }
    }
  }, 2000);

  // Reproduce los sonidos de victoria
  sonido_ganador.play();
  sonido_win.play();

}

// Función que verifica si el jugador ha perdido al descubrir una mina
function verificarPerdedor() {
  if (!enJuego) return; // Si el juego ya terminó, no hace nada

  // Recorre todas las celdas del tablero
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      // Si se descubre una mina (valor -1) el jugador ha perdido
      if (tablero[c][f].valor == -1 && tablero[c][f].estado == `descubierto`) {
        enJuego = false; // Marca que el juego ha terminado (el jugador ha perdido)

        sonido_perdedor.play(); // Reproduce el sonido de derrota

        // Reproduce el sonido de game over con un retraso de 2 segundos (2000 ms)
        setTimeout(() => {
          sonido_gameover.play();
        }, 1000);

        // Detener el temporizador cuando se pierde
        clearInterval(temporizador);

        // Cambia el color de todas las minas a rojo con una transición
        for (let f2 = 0; f2 < filas; f2++) {
          for (let c2 = 0; c2 < columnas; c2++) {
            if (tablero[c2][f2].valor == -1) {
              let celda = document.getElementById(`celda-${c2}-${f2}`);
              celda.innerHTML = `<i class="fas fa-bomb"></i>`; // Muestra la bomba
              celda.classList.add("mina-roja"); // Aplica clase para transición a rojo
            }
          }
        }

        // Después de 2 segundos, cambia todas las minas a negro
        setTimeout(() => {
          for (let f2 = 0; f2 < filas; f2++) {
            for (let c2 = 0; c2 < columnas; c2++) {
              if (tablero[c2][f2].valor == -1) {
                let celda = document.getElementById(`celda-${c2}-${f2}`);
                celda.classList.remove("mina-roja"); // Elimina la clase roja
                celda.classList.add("mina-negra"); // Aplica la clase negra (color final)
              }
            }
          }
        }, 2000);

        return; // Detiene la ejecución después de confirmar la derrota
      }
    }
  }
}

// Función que genera el tablero de juego desde cero
function generarTableroJuego() {
  vaciarTablero(); // Vacía el tablero para iniciar una nueva partida
  ponerMinas(); // Coloca las minas en el tablero
  contadoresMinas(); // Calcula los números que indican las minas cercanas
}

/*
    Función que limpia el tablero antes de generar uno nuevo
*/
function vaciarTablero() {
  tablero = [] // Reinicia el tablero como un arreglo vacío
  // Inicializa las columnas vacías del tablero
  for (let c = 0; c < columnas; c++) {
    tablero.push([]); // Añade un arreglo vacío para cada columna
  }
}

// Función que coloca las minas aleatoriamente en el tablero
function ponerMinas() {
  for (let i = 0; i < minas; i++) { // Repite el proceso tantas veces como minas haya
    let c, f;

    // Genera una columna y fila aleatorias hasta que encuentre una celda vacía
    do {
      c = Math.floor(Math.random() * columnas); // Genera una columna aleatoria
      f = Math.floor(Math.random() * filas); // Genera una fila aleatoria
    } while (tablero[c][f]); // Verifica que no haya mina en la celda seleccionada

    // Inserta una mina en la celda seleccionada
    tablero[c][f] = {
      valor: -1 // -1 indica que es una mina
    };
  }
}

// Función que cuenta el número de minas adyacentes a cada celda
function contadoresMinas() {
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (!tablero[c][f]) { // Si la celda no tiene mina (no está definida)
        let contador = 0; // Inicializa el contador de minas cercanas

        // Recorre las celdas vecinas (8 celdas alrededor)
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i == 0 && j == 0) {
              continue; // Omite la celda actual
            }
            try { // Intentamos acceder a las celdas vecinas y protegemos de errores con try-catch
              // Si la celda vecina tiene una mina (valor -1), incrementa el contador
              if (tablero[c + i][f + j].valor == -1) {
                contador++;
              }
            } catch (e) { } // Si la celda vecina está fuera de los límites, ignora el error
          }
        }
        // Asigna el número de minas adyacentes a la celda
        tablero[c][f] = {
          valor: contador // El valor de la celda será el contador de minas cercanas
        };
      }
    }
  }
}


/* función de nuevo juego reinicia todos los valores
function nuevoJuego() {
  generarTableroJuego(); 
  enJuego = true;
  sonido_juegonuevo.play(); // Reproduce el sonido de inicio de juego
  reiniciarVariables(); // Resetea las variables del juego
  generarTableroHTML(); // Genera la estructura visual del tablero
  generarTableroJuego(); // Genera las minas y números en el tablero
  añadirEventos(); // Añade los eventos de interacción del jugador
  refrescarTablero(); // Actualiza el estado visual del tablero según la lógica del juego

  // Reinicia el contador de tiempo
  tiempoTranscurrido = 0;
  document.getElementById("temporizador").innerText = tiempoTranscurrido; 

  // Reinicia el temporizador
  if (temporizador) {
    clearInterval(temporizador); 
  }

  // Inicia el temporizador de nuevo
  temporizador = setInterval(function() {
    tiempoTranscurrido++;
    document.getElementById("temporizador").innerText = tiempoTranscurrido; 
  }, 1000);
}*/