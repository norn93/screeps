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

const LOG_TODO = false;
const LOG_DIAGNOSTICS = true;

var cpu_lpf = Game.cpu.bucket;
const cpu_lpf_alpha = 0.05;

module.exports.loop = function () {
    
    console.log(Game.time, "=======================TICK=======================");

    if (LOG_TODO) {
        console.log("TODO: Claim a 3rd room!");
        console.log("TODO: Produce a full battle report");
        console.log("TODO: Get other creeps to send spawn signals in advance, like the miners");
        console.log("TODO: Add a container miner for the main spwan");
        console.log("TODO: Make a spawning queue system that manages all the spawning");
        console.log("TODO: Add states to defenders");
        console.log("TODO: Add ability for defenders to move on ramparts only");
        console.log("TODO: Add healers");
        console.log("TODO: Add wall repairers");
        console.log("TODO: Automate testing code?");
    }

    // Make pixels when we have spare CPU in our bucket
    var new_cpu_lpf = cpu_lpf * (1 - cpu_lpf_alpha) + Game.cpu.bucket * cpu_lpf_alpha;
    console.log("Averaged CPU:", new_cpu_lpf);
    if (new_cpu_lpf < cpu_lpf) {
        console.log("We are running out of CPU!");
        Game.notify(
            "We are running out of CPU!",
            5  // group these notifications for 5 minutes
        );
    }
    cpu_lpf = new_cpu_lpf;
    if (Game.cpu.bucket > 9000) {
        Game.cpu.generatePixel();
        console.log("Created a pixel!")
        cpu_lpf = Game.cpu.bucket - 5000; // Try to reset correctly
    }

    for (var r in Game.rooms) {
        var room = Game.rooms[r];

        console.log("Running room:", room);

        // Get this room's spawn
        const spawn = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_SPAWN }
        })[0];

        // Get this room's storage
        const storage = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_STORAGE }
        })[0];

        // Constants
        var defenders_setpoint = 3;
        var freights_setpoint = 1;
        var harvesters_setpoint = 2;
        var freights_setpoint = 1;
        var builders_setpoint = 2;
        var upgraders_setpoint = 6;
        var linkminers_setpoint = 1;
        var linkupgraders_setpoint = 4;

        // Clear memory
        for (var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                // console.log('Clearing non-existing creep memory:', name);
            }
        }
        
        // Check if we're being attacked or not
        var hostiles = spawn.room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length) {
            // If we can see hostiles, then we're being attacked
            spawn.memory.roomAttacked = true;
            defenders_setpoint = hostiles.length; // Make as many defenders as there are attackers
        } else {
            // We can't see hostiles, so we aren't being attacked
            spawn.memory.roomAttacked = false;
            defenders_setpoint = 0;
        }
        // Get a list of hostile healers in the room
        var hostile_healers = spawn.room.find(FIND_HOSTILE_CREEPS, {
            filter: (creep) => {
                return (creep.getActiveBodyparts(HEAL) != 0);
            }
        });
        // If there are no healers, make no defenders
        if (hostile_healers.length == 0) {
            defenders_setpoint = 0;
        }
        // Check if we need a freight in this room
        if (!storage) {
            freights_setpoint = 0;
        }

        // Check the room controller level
        var rcl = room.controller.level;
        
        // Check how much spawning energywe have
        var spawn_energy = spawn.room.energyAvailable;

        // Count the creeps we have
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.room == room);
        var freights = _.filter(Game.creeps, (creep) => creep.memory.role == 'freight' && creep.room == room);
        // For the builder, count across all rooms
        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.room == room);
        var defenders = _.filter(Game.creeps, (creep) => creep.memory.role == 'defender' && creep.room == room);
        var linkminers = _.filter(Game.creeps, (creep) => creep.memory.role == 'linkminer' && creep.room == room);
        var linkupgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'linkupgrader' && creep.room == room);
        
        // Shpw some diagnostics
        if (LOG_DIAGNOSTICS) {
            console.log("CPU in bucket:", Game.cpu.bucket);
            console.log("RCL:", rcl);
            console.log("Energy:", spawn_energy);
            console.log('Harvesters: ' + harvesters.length);
            console.log('Freights: ' + freights.length);
            console.log('Builders: ' + builders.length);
            console.log('Upgraders: ' + upgraders.length);
            console.log('Defenders: ' + defenders.length);
            console.log('Link miners: ' + linkminers.length);
            console.log('Link upgraders: ' + linkupgraders.length);
        }

        // Get 1 harvester
        if (harvesters.length < harvesters_setpoint && freights.length == 0) {
            if (spawn_energy < 4 * 100 + 2 * 50 + 4 * 50) {
                spawnCreep(spawn, "harvester", 2, 1, 1);
            } else {
                spawnCreep(spawn, "harvester", 4, 2, 4);
            }
        }
        
        // Then 1 freight
        if (freights.length < freights_setpoint &&
            harvesters.length > 0) {
            if (spawn_energy < 450) {
                spawnCreep(spawn, "freight", 0, 4, 2);
            } else {
                spawnCreep(spawn, "freight", 0, 6, 3);
            }
        }

        // Then defenders
        if (defenders.length < defenders_setpoint &&
            freights.length >= freights_setpoint &&
            harvesters.length > 0) {
            if (spawn_energy < (6 * 80 + 13 * 50 + 20 * 10)) {
                spawnCreep(spawn, "defender", 0, 0, 6, 2, 10);
            } else {
                spawnCreep(spawn, "defender", 0, 0, 13, 6, 20);
            }
        }
        
        // Then top up harvesters
        if (harvesters.length < harvesters_setpoint &&
            defenders.length >= defenders_setpoint &&
            freights.length >= freights_setpoint) {
            if (spawn_energy < 4 * 100 + 2 * 50 + 4 * 50) {
                spawnCreep(spawn, "harvester", 2, 1, 1);
            } else {
                spawnCreep(spawn, "harvester", 4, 2, 4);
            }
        }

        // Check if there's any building to do
        var targets = []
        for (var i in Game.rooms) { // Search in all rooms, find any target
            var room = Game.rooms[i];
            var this_room_targets = room.find(FIND_CONSTRUCTION_SITES);
            if (this_room_targets.length) {
                targets = this_room_targets;
            }
        }
        if(targets.length == 0) {
            // We shouldn't build
            builders_setpoint = 0;
        }
        
        // Then make a builder, if needed
        if (builders.length < builders_setpoint &&
            harvesters.length >= harvesters_setpoint &&
            defenders.length >= defenders_setpoint &&
            freights.length >= freights_setpoint) {
            if (spawn_energy < 1000) {
                spawnCreep(spawn, "builder", 2, 1, 1);
            } else {
                spawnCreep(spawn, "builder", 5, 5, 5);
            }
        }

        // Then make a link miner (only for higher levels)
        if (rcl >= 5 &&
            linkminers.length < linkminers_setpoint &&
            builders.length >= builders_setpoint &&
            harvesters.length >= harvesters_setpoint &&
            defenders.length >= defenders_setpoint &&
            freights.length >= freights_setpoint) {
            if (spawn_energy < (5*100 + 1*50 + 3*50)) {
                spawnCreep(spawn, "linkminer", 2, 1, 1);
            } else {
                spawnCreep(spawn, "linkminer", 5, 1, 3);
            }
        }

        // Then make a link upgrader (only for higher levels)
        if (rcl >= 5 &&
            linkupgraders.length < linkupgraders_setpoint &&
            builders.length >= builders_setpoint &&
            harvesters.length >= harvesters_setpoint &&
            defenders.length >= defenders_setpoint &&
            freights.length >= freights_setpoint) {
            if (spawn_energy < (5*100 + 1*50 + 3*50)) {
                spawnCreep(spawn, "linkupgrader", 2, 1, 1);
            } else {
                spawnCreep(spawn, "linkupgrader", 5, 1, 3);
            }
        }

        // Then make a few upgraders (only for lower levels)
        if (rcl <= 5 &&
            upgraders.length < upgraders_setpoint &&
            builders.length >= builders_setpoint &&
            harvesters.length >= harvesters_setpoint &&
            defenders.length >= defenders_setpoint &&
            freights.length >= freights_setpoint) {
            if (spawn_energy < 450) {
                spawnCreep(spawn, "upgrader", 2, 1, 1);
            } else {
                spawnCreep(spawn, "upgrader", 3, 2, 3);
            }
        }
        
        // Spawn that creep
        if (spawn.spawning) { 
            var spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                spawn.pos.x + 1, 
                spawn.pos.y, 
                {align: 'left', opacity: 0.8});
        }

        // Assign roles to creeps
        for (var name in Game.creeps) {
            var creep = Game.creeps[name];
            if(creep.memory.role == 'harvester') {
                roleHarvester.run(creep, spawn);
            }
            if(creep.memory.role == 'upgrader') {
                roleUpgrader.run(creep, spawn);
            }
            if(creep.memory.role == 'builder') {
                roleBuilder.run(creep, spawn);
            }
            if(creep.memory.role == 'freight') {
                roleFreight.run(creep, spawn);
            }
            if(creep.memory.role == 'defender') {
                roleDefender.run(creep, spawn);
            }
            if(creep.memory.role == 'linkminer') {
                roleLinkMiner.run(creep, spawn);
            }
            if(creep.memory.role == 'linkupgrader') {
                roleLinkUpgrader.run(creep, spawn);
            }
            if(creep.memory.role == 'claimer') {
                roleClaimer.run(creep, spawn);
            }
        }

        // Get a list of towers in the room
        var towers = spawn.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_TOWER);
            }
        });

        // For each tower
        for (var i in towers) {
            var tower = towers[i];
            roleTower.run(tower, spawn);
        }
        
        // Send an email if we're being attacked by a big force
        if (spawn.memory.roomAttacked && defenders_setpoint != 0) {
            console.log('We are being attacked by a large force in ' + room + "!");
            Game.notify(
                'We are being attacked by a large force in ' + room + "!",
                5  // group these notifications for 5 minutes
            );
        }
        // Send an email if we're being attacked by a small force
        if (spawn.memory.roomAttacked && defenders_setpoint == 0) {
            console.log("We are being attacked by a small force in " + room + "...");
            Game.notify(
                "We are being attacked by a small force in " + room + "...",
                5  // group these notifications for 5 minutes
            );
        }

        // Check that all the link miners know which source they're supposed to be working on
        for (var i in linkminers) {
            var linkminer = linkminers[i];
            linkminer.memory.source = 0; // We want them to be tied to that first source
        }

        // Run link network
        linkNetwork(room);

        // Run room claimer
        claimRoom();
    }
}