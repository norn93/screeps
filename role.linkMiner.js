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
                if(creep.harvest(creep.memory.source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.memory.source, {visualizePathStyle: {stroke: '#ffaa00'}});
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