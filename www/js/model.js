/*
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * <ravera.emanuwl@gmail.com> wrote this file.  As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return.   Emanuel Ravera
 * ----------------------------------------------------------------------------
 */

var Global = { partida: null, 
               equipo_activo: null,
               contacts_loaded: false,
               init: false
             };

/* Model Object Definition */    
function Partida (equipos) {
    this.equipos = equipos || [];
    this.fecha = new Date();    
}

function Equipo (nombre) {
    this.nombre = nombre;
    this.integrantes = [];
    this.puntaje = 0;
    this.buenas = false;
    this.addIntegrante = function(name) {
        this.integrantes.push(new Persona(name));
    };    
}
    
function Persona(nombre) {
    this.nombre = nombre;
}