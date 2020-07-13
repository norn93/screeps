var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleFreight = require('role.freight');
var roleTower = require('role.tower');

var test = require('testFunctions');

var WALL_HEALTH = 10000;

module.exports.loop = function () {
    
    console.log("=======================TICK=======================")

    console.log("TODO: Automate testing code");
    console.log("TODO: Make a small standing army");
    console.log("TODO: Modularise some of the code");

    // Clear memory
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    
    // Check if we're being attacked or not
    var hostiles = Game.spawns['Spawn1'].room.find(FIND_HOSTILE_CREEPS);
    if(hostiles.length) {
        // If we can see hostiles, then we're being attacked
        Game.spawns['Spawn1'].memory.roomAttacked = true;
    } else {
        // We can't see hostiles, so we aren't being attacked
        Game.spawns['Spawn1'].memory.roomAttacked = false;
    }

    // COnsole prints
    var rcl = Game.spawns['Spawn1'].room.controller.level;
    console.log("RCL:", rcl);

    console.log("Current WALL_HEALTH setpoint:", WALL_HEALTH);
    
    // Make pixels when we have spare CPU in our bucket
    console.log("CPU in bucket:", Game.cpu.bucket);
    if(Game.cpu.bucket > 9000) {
        Game.cpu.generatePixel();
        console.log("Created a pixel!")
    }
    
    var spawn_energy = Game.spawns['Spawn1'].room.energyAvailable;
    console.log("Energy:", spawn_energy);
    
    if (spawn_energy < 300) {
        console.log("We are out of energy");
    }

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);
    
    var freights = _.filter(Game.creeps, (creep) => creep.memory.role == 'freight');
    console.log('Freights: ' + freights.length);
    
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    console.log('Builders: ' + builders.length);
    
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    console.log('Upgraders: ' + upgraders.length);

    // Get 1 harvester
    if(harvesters.length < 1 && freights.length == 0) {
        var newName = 'Harvester' + Game.time;
        console.log('Spawning new harvester: ' + newName);
        if (spawn_energy < 450) {
            Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,MOVE], newName, 
                {memory: {role: 'harvester'}});
        } else {
            Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,MOVE,MOVE], newName, 
                {memory: {role: 'harvester'}});
        }
    }
    
    // Then 1 freight
    if(freights.length < 1 && harvesters.length > 0) {
        var newName = 'Freight' + Game.time;
        console.log('Spawning new freight: ' + newName);
        
        if (spawn_energy < 450) {
            Game.spawns['Spawn1'].spawnCreep([CARRY,CARRY,CARRY,CARRY,MOVE,MOVE], newName, 
            {memory: {role: 'freight'}});
        } else {
            Game.spawns['Spawn1'].spawnCreep([CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], newName, 
            {memory: {role: 'freight'}});
        }
    }
    
    // Then top up harvesters
    if(harvesters.length < 4 && freights.length > 0) {
        var newName = 'Harvester' + Game.time;
        console.log('Spawning new harvester: ' + newName);
        if (spawn_energy < 450) {
            Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,MOVE], newName, 
                {memory: {role: 'harvester'}});
        } else {
            Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,MOVE,MOVE], newName, 
                {memory: {role: 'harvester'}});
        }
    }
    
    // Then make a builder
    if(builders.length < 1 && harvesters.length > 3 && freights.length > 0) {
        var newName = 'Builder' + Game.time;
        console.log('Spawning new builder: ' + newName);
        if (spawn_energy < 450) {
            Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,MOVE], newName, 
                {memory: {role: 'builder'}});
        } else {
            Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,MOVE,MOVE], newName, 
                {memory: {role: 'builder'}});
        }
    }

    // Then make 7 upgraders
    if(upgraders.length < 7 && builders.length > 0 && harvesters.length > 3 && freights.length > 0) {
        var newName = 'Upgrader' + Game.time;
        console.log('Spawning new upgrader: ' + newName);
        if (spawn_energy < 450) {
            Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,MOVE], newName, 
                {memory: {role: 'upgrader'}});
        } else {
            Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE], newName, 
                {memory: {role: 'upgrader'}});
        }
    }
    
    // Spawn that creep
    if(Game.spawns['Spawn1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }

    // Assign roles to creeps
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'freight') {
            roleFreight.run(creep);
        }
    }

    // Get a list of towers in the room
    var towers = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_TOWER);
        }
    });

    // For each tower
    for(var i in towers) {
        var tower = towers[i];
        roleTower.run(tower);
    }
    
    // Send an email if we're bing attacked
    if (Game.spawns['Spawn1'].memory.roomAttacked) {
        console.log("We are beng attacked!");
        Game.notify(
            'We are being attacked!',
            5  // group these notifications for 5 minutes
        );
    }
}