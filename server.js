var roomLink = null;
var jueganTodosMode = false;

// Base de datos ficticia para almacenar las horas, productos comprados y prefijos por jugador
var playerDataDB = {};

var room = HBInit({
    roomName: '⚽Juegan Todos con Nico_escu08⚽',
    maxPlayers: 30,
    public: true,
    geo: {
        code: "AR",
        lat: -34.6037,
        lon: -58.3816
    },
    scoreLimit: 3,
    timeLimit: 3,
    redKO: true,
    blueKO: true,
    kickOffWait: 0,
    kickOffReset: false,
    noPlayer: true
});

var superAdminAssigned = false;

function sendColoredAnnouncement(message, playerId, color = 0xFF0000) {
    room.sendAnnouncement(message, playerId, color, 'bold');
}

function assignSuperAdmin(player) {
    room.setPlayerAdmin(player.id, true);
    sendColoredAnnouncement(player.name + ' ahora es un superadmin!', null, 0x00FF00);
    superAdminAssigned = true;
}

room.onPlayerJoin = function onPlayerJoin(player) {
    room.sendAnnouncement('🎉 ¡' + player.name + ' ha llegado! 🎉', null, 0xFF0000, 'bold');
    room.sendAnnouncement('¡Bienvenido a la comunidad de Nico_escu08!', player.id, 0x00FF00, 'bold');
    room.sendAnnouncement('📢 Únete a nuestro Discord: https://discord.gg/Nico_escu08 ', player.id);

    if (!superAdminAssigned && player.name === 'Nico_escu08') {
        assignSuperAdmin(player);
    }

    // Inicializar datos del jugador en la base de datos
    playerDataDB[player.name] = {
        hours: 0,
        vip: false,
        size: 10,
        prefix: ""
    };
};

room.onPlayerLeave = function onPlayerLeave(player) {
    // Eliminar datos del jugador al salir de la sala
    delete playerDataDB[player.name];
};

room.onPlayerChat = function(player, message) {
    if (message === '!08') {
        if (!superAdminAssigned) {
            assignSuperAdmin(player);
        } else {
            room.sendAnnouncement('Ya hay un superadmin asignado.', player.id, 0xFF0000);
        }
    } else if (message === '!horas') {
        showPlayerHours(player.id, player.name);
    } else if (message === '!tienda') {
        showStore(player.id);
    } else if (message.startsWith('!comprar')) {
        buyProduct(player, message);
    } else if (message.startsWith('!prefix')) {
        setPrefix(player, message);
    } else if (message === '!ayuda') {
        showHelp(player.id);
    }
};

function showStore(playerId) {
    room.sendAnnouncement("Tienda:", playerId, 0xFFD700); 
    room.sendAnnouncement("VIP - 10 horas", playerId, 0xFFD700); 
    room.sendAnnouncement("Prefix - 38 horas", playerId, 0xFFD700); 
    room.sendAnnouncement("Size - 30 horas", playerId, 0xFFD700); 
}

function buyProduct(player, message) {
    var product = message.substring(9).trim();
    var playerData = playerDataDB[player.name]; 

    if (product === "VIP" && playerData.hours >= 10 && !playerData.vip) {
        playerData.hours -= 10;
        playerData.vip = true;
        room.sendAnnouncement(player.name + " ha comprado VIP.", null, 0x00FF00);
        // Otorgar el rango VIP (agregar la lógica necesaria)
    } else if (product === "Prefix" && playerData.hours >= 38 && !playerData.prefix) {
        playerData.hours -= 38;
        room.sendAnnouncement(player.name + ", por favor usa !prefix [TuPrefijo] para establecer tu propio prefijo.", null, 0x00FF00);
    } else if (product === "Size" && playerData.hours >= 30) {
        playerData.hours -= 30;
        playerData.size = 17;
        room.sendAnnouncement(player.name + " ha comprado Size.", null, 0x00FF00);
        // Cambiar tamaño (agregar la lógica necesaria)
    } else {
        room.sendAnnouncement("No tienes suficientes horas para comprar este producto o ya lo has comprado.", player.id, 0xFF0000);
    }
}

function setPrefix(player, message) {
    var prefix = message.substring(8).trim();
    var playerData = playerDataDB[player.name];

    if (prefix && prefix.length <= 20) { // Limitar la longitud del prefijo
        playerData.prefix = prefix;
        room.sendAnnouncement(player.name + " ha establecido su prefijo como '" + prefix + "'.", null, 0x00FF00);
        // Enviar datos actualizados a un webhook (agregar la lógica necesaria)
    } else {
        room.sendAnnouncement("Prefijo inválido. Por favor, utiliza un prefijo de hasta 20 caracteres.", player.id, 0xFF0000);
    }
}

function showPlayerHours(playerId, playerName) {
    var playerData = playerDataDB[playerName];
    room.sendAnnouncement("Horas disponibles para " + playerName + ": " + playerData.hours, playerId, 0xFFD700); 
}

function showHelp(playerId) {
    room.sendAnnouncement("Comandos disponibles:", playerId, 0xFFD700); 
    room.sendAnnouncement("!ayuda - Muestra la lista de comandos disponibles.", playerId, 0xFFD700); 
    room.sendAnnouncement("!tienda - Muestra los productos disponibles en la tienda.", playerId, 0xFFD700); 
    room.sendAnnouncement("!comprar [producto] - Compra un producto de la tienda.", playerId, 0xFFD700); 
    room.sendAnnouncement("!horas - Muestra las horas que tienes en la sala.", playerId, 0xFFD700); 
    room.sendAnnouncement("!prefix [TuPrefijo] - Establece tu propio prefijo.", playerId, 0xFFD700); 
}
