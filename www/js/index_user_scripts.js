(function()
{
 "use strict";
 
 /*
   hook up event handlers 
 */
 function register_event_handlers()
 {
    $(document).on("click", ".uib_w_3", function(evt)
    {
        // Boton Anotar
        activate_subpage("#uib_page_2sub");
        resetApplication();
    });
     
    $(document).on("click", ".uib_w_4", function(evt)
    {
        //Boton historico
        activate_subpage("#uib_page_1sub");
        listSavedPartidas();
    });
     
    $("#btn-nos").on("click", function() {
        Global.equipo_activo = 'nos';
        activate_subpage("#uib_page_3sub");
        showContacts();
    });
     
    $("#btn-ellos").on("click", function() {
        Global.equipo_activo = 'ellos';
        activate_subpage("#uib_page_3sub");
        showContacts();
    });
    
    $("#sumar-nos").on("click", function() {
        Global.equipo_activo = 'nos';
        sumarPunto();
    });
    
    $("#restar-nos").on("click", function() {
        Global.equipo_activo = 'nos';
        restarPunto();
    });
     
    $("#sumar-ellos").on("click", function() {
        Global.equipo_activo = 'ellos';
        sumarPunto();
    });
    
    $("#restar-ellos").on("click", function() {
        Global.equipo_activo = 'ellos';
        restarPunto();
    });
    
    $('#btn-back-tablero').on('click', function(){
        savePartida();
    });
     
    $(document).on("click", ".contact", function(evn){
        addTeamMember($(evn.target).text());
    });
    
    $(document).on("click", ".history", function(evn){
        resetApplication();
        loadPartida($(evn.target).attr('data-partida'));
        activate_subpage("#uib_page_2sub", 'no-history');
    });
}

// Actions when the document finish load
$(document).ready(function(){ init(); });

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
    
/* Methods definition */
function init() {    
    var equipos = [new Equipo('nos'), new Equipo('ellos')];
    Global.partida = new Partida(equipos);
    if(!Global.init){
        register_event_handlers();
        Global.init = true;
    }
}
    
function resetApplication() {
    Global.partida = null;
    Global.contacts_loaded = false;
    init();
    cleanStateUI();
}

// Cada vez que aprieta anotar crea una nueva
function cleanStateUI() {
    //Limpio los equipos
    var selectors = ['#name-nos', '#name-ellos', '#tablero-ellos', '#tablero-nos'];
    for(var i=0; i < selectors.length; i++){
        $(selectors[i]).children().remove();
    }
}
    
/* Puntajes Screen */
function showContacts() {
   var options = new ContactFindOptions();
   options.multiple = true;
   var fields = ["name"];
   navigator.contacts.find(fields, onSuccessContacts, onErrorContacts, options);
}
    
function onSuccessContacts(contacts) {
    //Only load once because it consumes lots of resources
    if(Global.contacts_loaded) return;
    
    var list = $('#contact-list');    
    list.children().remove();    
    for (var i = 0; i < contacts.length; i++) {
        if(contacts[i].name) {
            if(contacts[i].name.formatted.indexOf('@') === -1 && contacts[i].name.formatted != '') {
                appendContactsList(contacts[i].name.formatted, list);
            }
        }
    }
    
    //Finish load contacts
    Global.contacts_loaded = true;
}

function onErrorContacts(contactError) {
    alert('Error cargando los contactos');
}

function appendContactsList(contact, list) {
    var listItem = $('<li class="widget contact" data-uib="app_framework/listitem" data-ver="1"><a>' + contact + '</a></li>');    
    list.append(listItem);
}
    
function getIndex(team) {
    var equipo = null;
    if(team === 'nos') equipo = 0;
    else if(team === 'ellos') equipo = 1;
    return equipo;
}

function addTeamMember(name){    
    var team = Global.equipo_activo;
    var index = getIndex(team);         
    if(Global.partida.equipos[index].integrantes.length < 3){
        Global.partida.equipos[index].addIntegrante(name);
        appendTeamMemberName(team, name);
        
        //Return to the previous page
        activate_subpage("#uib_page_2sub", 'no-history');
    } else {
        alert('El equipo ' + team + ' no puede tener mas de 3 miembros.');
    }
}

function appendTeamMemberName(team, name){
    $('#name-' + team).append('<h4 class="center">' + name + '</h4>');
}
    
function sumarPunto(){
    var team = Global.equipo_activo;
    var index = getIndex(team);
    Global.partida.equipos[index].puntaje += 1;    
    dibujarTablero(team, Global.partida.equipos[index].puntaje);
}
    
function restarPunto(team){
    var team = Global.equipo_activo;
    var index = getIndex(team);
    if(Global.partida.equipos[index].puntaje >= 1) Global.partida.equipos[index].puntaje -= 1;
    dibujarTablero(team, Global.partida.equipos[index].puntaje);
}

function dibujarTablero(team, puntos) {
    var tablero = $("#tablero-" + team);
    
    //First implementation always clean the hole screen
    tablero.children().remove();
    
    //Calculos de division y resto para dibujar tanteador
    var full = Math.floor(puntos/5);
    var resto = puntos % 5;
    
    if(full > 0) {
        for(var i=0; i<full;i++) {
            var image_five = $('<img class="five center-obj" src="images/blank.gif">');
            tablero.append(image_five);
        }
    }
    
    if(resto > 0){
        var image = $('<img class="center-obj" src="images/blank.gif">');
        if(resto === 1) image.addClass("one");
        if(resto === 2) image.addClass("two");
        if(resto === 3) image.addClass("three");
        if(resto === 4) image.addClass("four");
        tablero.append(image);
    }
}

function listSavedPartidas(){
    var history = JSON.parse(localStorage.getItem('partidas'));
    var fecha_str;
    
    //Generate the list
    var list = $('#partidas-list');
    list.children().remove();
    for(var i=0; i < history.partidas.length;i++){
        var listItem = $('<li class="widget history" data-uib="app_framework/listitem" data-ver="1"><a data-partida=' + i + '>Puntaje: NOS: ' + history.partidas[i].equipos[0].puntaje + '- ELLOS: ' + history.partidas[i].equipos[1].puntaje + '</a></li>');
        list.append(listItem);
    }
}

function savePartida(){
    //retrieve data
    var oldItems = JSON.parse(localStorage.getItem('partidas'));
    
    //First time init
    if(!oldItems) oldItems = { partidas: [] };    
    
    //Push the current partida
    oldItems.partidas.push(Global.partida);
    
    //set data in LocalStorage
    localStorage.setItem('partidas', JSON.stringify(oldItems));
}
    
function loadPartida(index){
    var history = JSON.parse(localStorage.getItem('partidas'));    
    var partida = history.partidas[index];
    var team = '';
    
    for(var i=0;i<partida.equipos.length;i++) {
        team = partida.equipos[i].nombre;
        
        //Append the team names
        for(var j=0; j<partida.equipos[i].integrantes.length; j++){        
            appendTeamMemberName(team, partida.equipos[i].integrantes[j].nombre);
        }
        
        //Append the results
        dibujarTablero(team, partida.equipos[i].puntaje);    
    }
    
    //set current global partida the loaded one and remove from history
    Global.partida = partida;    
    history.partidas.splice(index,1);
    
    //set data in LocalStorage
    localStorage.setItem('partidas', JSON.stringify(history));
}
    
})();
