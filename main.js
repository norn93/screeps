var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleFreight = require('role.freight');
var roleTower = require('role.tower');
var roleDefender = require('role.defender');

var spawnCreep = require('spawnCreep');

module.exports.loop = function () {
    
    console.log("=======================TICK=======================");

    console.log("TODO: Deal with healers");
    console.log("TODO: Play with links");
    console.log("TODO: Automate testing code?");    

    // Constants
    var defenders_setpoint = 3;
    var harvesters_setpoint = 4;
    var freights_setpoint = 1;
    var builders_setpoint = 5;
    var upgraders_setpoint = 7;

    // Clear memory
    for (var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    
    // Check if we're being attacked or not
    var hostiles = Game.spawns['Spawn1'].room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length) {
        // If we can see hostiles, then we're being attacked
        Game.spawns['Spawn1'].memory.roomAttacked = true;
    } else {
        // We can't see hostiles, so we aren't being attacked
        Game.spawns['Spawn1'].memory.roomAttacked = false;
        defenders_setpoint = 0;
    }

    // Console prints
    var rcl = Game.spawns['Spawn1'].room.controller.level;
    console.log("RCL:", rcl);
    
    // Make pixels when we have spare CPU in our bucket
    console.log("CPU in bucket:", Game.cpu.bucket);
    if (Game.cpu.bucket > 9000) {
        Game.cpu.generatePixel();
        console.log("Created a pixel!")
    }
    
    var spawn_energy = Game.spawns['Spawn1'].room.energyAvailable;
    console.log("Energy:", spawn_energy);
    
    if (spawn_energy < 300) {
        console.log("We are out of energy...");
    }

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);
    
    var freights = _.filter(Game.creeps, (creep) => creep.memory.role == 'freight');
    console.log('Freights: ' + freights.length);
    
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    console.log('Builders: ' + builders.length);
    
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    console.log('Upgraders: ' + upgraders.length);

    var defenders = _.filter(Game.creeps, (creep) => creep.memory.role == 'defender');
    console.log('Defenders: ' + defenders.length);

    // Get 1 harvester
    if (harvesters.length < harvesters_setpoint && freights.length == 0) {
        if (spawn_energy < 450) {
            spawnCreep("harvester", 2, 1, 1);
        } else {
            spawnCreep("harvester", 3, 1, 2);
        }
    }
    
    // Then 1 freight
    if (freights.length < 1 &&
        harvesters.length > 0) {
        if (spawn_energy < 450) {
            spawnCreep("freight", 0, 4, 2);
        } else {
            spawnCreep("freight", 0, 6, 3);
        }
    }

    // Then defenders
    if (defenders.length < defenders_setpoint &&
        freights.length > 0 &&
        harvesters.length > 0) {
        if (spawn_energy < (160 + 150 + 100)) {
            spawnCreep("defender", 0, 0, 3, 2, 10);
        } else {
            spawnCreep("defender", 0, 0, 3, 5, 20);
        }
    }
    
    // Then top up harvesters
    if (harvesters.length < harvesters_setpoint &&
        freights.length > 0) {
        if (spawn_energy < 450) {
            spawnCreep("harvester", 2, 1, 1);
        } else {
            spawnCreep("harvester", 3, 1, 2);
        }
    }

    // Check if there's any building to do
    var targets = Game.spawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES);
    if(targets.length == 0) {
        // We shouldn't build
        builders_setpoint = 0;
    }
    
    // Then make a builder
    if (builders.length < builders_setpoint &&
        harvesters.length >= harvesters_setpoint &&
        defenders.length == defenders_setpoint &&
        freights.length > 0) {
        if (spawn_energy < 450) {
            spawnCreep("builder", 2, 1, 1);
        } else {
            spawnCreep("builder", 3, 1, 2);
        }
    }

    // Then make a few upgraders
    if (upgraders.length < upgraders_setpoint &&
        builders.length >= builders_setpoint &&
        harvesters.length >= harvesters_setpoint &&
        defenders.length == defenders_setpoint &&
        freights.length > 0) {
        if (spawn_energy < 450) {
            spawnCreep("upgrader", 2, 1, 1);
        } else {
            spawnCreep("upgrader", 3, 2, 3);
        }
    }
    
    // Spawn that creep
    if (Game.spawns['Spawn1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }

    // Assign roles to creeps
    for (var name in Game.creeps) {
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
        if(creep.memory.role == 'defender') {
            roleDefender.run(creep);
        }
    }

    // Get a list of towers in the room
    var towers = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_TOWER);
        }
    });

    // For each tower
    for (var i in towers) {
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

    // Also, if we're bing attacked, spawn a defender
}