var spawnCreep = require('spawnCreep');

var roleLinkMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // Calculate the miner state
        // States:
        // Mining (0)
        // Emptying (1)

        // Get this room's spawn
        const spawn = creep.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_SPAWN }
        })[0];
        
        if (creep.memory.status != 1 && creep.store.getFreeCapacity() == 0) {
            creep.memory.status = 1;
            creep.say("Emptying");
        }
        if (creep.memory.status != 0 && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.status = 0;
            creep.say("Mining");
        }

        if (creep.memory.status == 0) {
            // Mining
            // Go to the link that you're supposed to
            // If you haven't been allocated one yet, then say so
            if (creep.memory.source == null) {
                creep.say("Source?");
            } else {
                var sources = creep.room.find(FIND_SOURCES);
                if(creep.harvest(sources[creep.memory.source]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[creep.memory.source], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }

            if (creep.store[RESOURCE_ENERGY] > 0) {
                // Check for a nearby link
                const link = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            structure.structureType == STRUCTURE_LINK
                        );
                    }
                });
                if(creep.transfer(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(link, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }

        if (creep.memory.status == 1) {
            // Emptying
            // Empty into the nearest link, move if needed
            const link = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return (
                        structure.structureType == STRUCTURE_LINK
                    );
                }
            });
            if(creep.transfer(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(link, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }

        // TODO: Tidy code #CPU, maybe cache the path?
        // DEBUG: Testing distance
        var ret = PathFinder.search(creep.pos, spawn.pos);
        var path_distance = ret.cost;
        const spawn_time = 27; // Measured
        const total_spawn_lead_time = path_distance + spawn_time;
        // console.log("Need to spawn a new one", total_spawn_lead_time, "in advance.");

        const current_ticks_to_live = creep.ticksToLive;

        // console.log("Currently,", current_ticks_to_live, "ticks to live.");

        if (creep.memory.replaced == null && current_ticks_to_live <= total_spawn_lead_time) {
            // console.log("Need to spawn a new one!");
            const role = "linkminer";
            var name = role + Game.time;
            const parts = [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
            spawnCreep(spawn, "linkminer", 5, 1, 3);
            creep.memory.replaced = true;
        }
    }
};

module.exports = roleLinkMiner;