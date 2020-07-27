var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleFreight = require('role.freight');
var roleTower = require('role.tower');
var roleDefender = require('role.defender');
var roleLinkMiner = require('role.linkMiner');
var roleLinkUpgrader = require('role.linkUpgrader');
var roleClaimer = require('role.claimer');

var spawnCreep = require('spawnCreep');
var linkNetwork = require('linkNetwork');
var claimRoom = require('claimRoom');

module.exports.loop = function () {
    
    console.log(Game.time, "=======================TICK=======================");

    console.log("TODO: Expand");
    console.log("TODO: Send stored energy through link network to room controller");
    console.log("TODO: Produce a battle report");
    console.log("TODO: Get link upgraders to send spawn signals in advance, like the miners");
    console.log("TODO: Add a container miner for the main spwan");
    console.log("TODO: Make a spawning queue system that manages all the spawning");
    console.log("TODO: Add states to defenders");
    console.log("TODO: Add ability for defenders to move on ramparts only");
    console.log("TODO: Add healers");
    console.log("TODO: Add wall repairers");
    console.log("TODO: Automate testing code?");    

    // Constants
    var defenders_setpoint = 3;
    var harvesters_setpoint = 4;
    var freights_setpoint = 1;
    var builders_setpoint = 1;
    var upgraders_setpoint = 0;
    var linkminers_setpoint = 1;
    var linkupgraders_setpoint = 2;

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
        defenders_setpoint = hostiles.length; // Make as many defenders as there are attackers
    } else {
        // We can't see hostiles, so we aren't being attacked
        Game.spawns['Spawn1'].memory.roomAttacked = false;
        defenders_setpoint = 0;
    }
    // Get a list of hostile healers in the room
    var hostile_healers = Game.spawns['Spawn1'].room.find(FIND_HOSTILE_CREEPS, {
        filter: (creep) => {
            return (creep.getActiveBodyparts(HEAL) != 0);
        }
    });
    // If there are no healers, make no defenders
    if (hostile_healers.length == 0) {
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

    var linkminers = _.filter(Game.creeps, (creep) => creep.memory.role == 'linkminer');
    console.log('Link miners: ' + linkminers.length);

    var linkupgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'linkupgrader');
    console.log('Link upgraders: ' + linkupgraders.length);

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
        if (spawn_energy < (6 * 80 + 13 * 50 + 20 * 10)) {
            spawnCreep("defender", 0, 0, 6, 2, 10);
        } else {
            spawnCreep("defender", 0, 0, 13, 6, 20);
        }
    }
    
    // Then top up harvesters
    if (harvesters.length < harvesters_setpoint &&
        defenders.length >= defenders_setpoint &&
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
        defenders.length >= defenders_setpoint &&
        freights.length > 0) {
        if (spawn_energy < 1000) {
            spawnCreep("builder", 2, 1, 1);
        } else {
            spawnCreep("builder", 5, 5, 5);
        }
    }

    // Then make a link miner
    if (linkminers.length < linkminers_setpoint &&
        builders.length >= builders_setpoint &&
        harvesters.length >= harvesters_setpoint &&
        defenders.length >= defenders_setpoint &&
        freights.length > 0) {
        if (spawn_energy < (5*100 + 1*50 + 3*50)) {
            spawnCreep("linkminer", 2, 1, 1);
        } else {
            spawnCreep("linkminer", 5, 1, 3);
        }
    }

    // Then make a link upgrader
    if (linkupgraders.length < linkupgraders_setpoint &&
        builders.length >= builders_setpoint &&
        harvesters.length >= harvesters_setpoint &&
        defenders.length >= defenders_setpoint &&
        freights.length > 0) {
        if (spawn_energy < (5*100 + 1*50 + 3*50)) {
            spawnCreep("linkupgrader", 2, 1, 1);
        } else {
            spawnCreep("linkupgrader", 5, 1, 3);
        }
    }

    // Then make a few upgraders
    if (upgraders.length < upgraders_setpoint &&
        builders.length >= builders_setpoint &&
        harvesters.length >= harvesters_setpoint &&
        defenders.length >= defenders_setpoint &&
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
        if(creep.memory.role == 'linkminer') {
            roleLinkMiner.run(creep);
        }
        if(creep.memory.role == 'linkupgrader') {
            roleLinkUpgrader.run(creep);
        }
        if(creep.memory.role == 'claimer') {
            roleClaimer.run(creep);
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

    // Check that all the link miners know which source they're supposed to be working on
    for (var i in linkminers) {
        var linkminer = linkminers[i];
        linkminer.memory.source = 0; // We want them to be tied to that first source
    }

    // Run link network
    linkNetwork();

    // Run room claimer
    claimRoom();
}