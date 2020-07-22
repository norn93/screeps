var roleLinkMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // Calculate the miner state
        // States:
        // Mining (0)
        // Emptying (1)
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
    }
};

module.exports = roleLinkMiner;