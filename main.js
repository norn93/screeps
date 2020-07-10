var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleFreight = require('role.freight');

var WALL_HEALTH = 10000;

module.exports.loop = function () {
    
    console.log("=======================TICK=======================")

    console.log("TODO: Automate testing code");
    console.log("TODO: Make a small standing army");
    console.log("TODO: Modularise some of the code");

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    
    var towers = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_TOWER);
        }
    });

    for(var i in towers) {
        var tower = towers[i];
        var hostiles = Game.spawns['Spawn1'].room.find(FIND_HOSTILE_CREEPS);
        if(hostiles.length > 0) {
            Game.spawns['Spawn1'].memory.roomAttacked = true;
            var max_healing_parts = 0;
            var worst_hostile = hostiles[0];
            for(var i in hostiles) {
                var hostile = hostiles[i];
                var healing_parts = 0;
                var body_contents = hostile.body;
                for (var body_element in body_contents) {
                    var this_part = body_contents[body_element]["type"]
                    if (this_part == "heal") {
                        healing_parts += 1;
                    }
                }
                if (healing_parts > max_healing_parts) {
                    worst_hostile = hostile;
                }
            }
            tower.attack(worst_hostile);
        } else {
            Game.spawns['Spawn1'].memory.roomAttacked = false;
        
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (
                        structure.hits < structure.hitsMax &&
                        structure.structureType != STRUCTURE_WALL &&
                        structure.structureType != STRUCTURE_RAMPART
                    );
                }
            });
            if (closestDamagedStructure == null) {
                // Then we should repair a wall or rampart
                var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            structure.hits < WALL_HEALTH &&
                            (structure.structureType == STRUCTURE_WALL ||
                            structure.structureType == STRUCTURE_RAMPART)
                        );
                    }
                });

            // If that still returns nothing, then we should check the storage
            // If it's reasonably full, then let's increase the wall limit by 1k
            if (closestDamagedStructure == null) {
                var total_storage = 0;
                var storages = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE)
                    }
                });
                for (var n in storages) {
                    var storage = storages[n];
                    total_storage += storage.store.getUsedCapacity();
                }
                if (total_storage > 250000) {
                    WALL_HEALTH += 1000;
                    WALL_HEALTH = max(WALL_HEALTH, 100000);
                }
            }

            }
            if(closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
            }
        }
    }

    console.log("Current WALL_HEALTH setpoint:", WALL_HEALTH);
    
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
    
    if(builders.length < 1 && harvesters.length > 2 && freights.length > 0) {
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

    if(upgraders.length < 7 && builders.length > 0 && harvesters.length > 2 && freights.length > 0) {
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
    
    

    
    
    if(Game.spawns['Spawn1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }

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
    
    if (Game.spawns['Spawn1'].memory.roomAttacked) {
        console.log("We are beng attacked!");
        Game.notify(
            'We are being attacked!',
            5  // group these notifications for 5 minutes
        );
    }

    Game.notify(
        'Code is running',
        60*24  // group these notifications each day
    );
}