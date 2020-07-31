var roleLinkUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // Calculate the upgrader state
        // States:
        // Upgrading (0)
        // Collecting (1)

        // Get this room's spawn
        const spawn = creep.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_SPAWN }
        })[0];
        
        if (creep.memory.status != 1 && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.status = 1;
            creep.say("Collecting");
        }
        if (creep.memory.status != 0 && creep.store.getFreeCapacity() == 0) {
            creep.memory.status = 0;
            creep.say("Upgrading");
        }

        if (creep.memory.status == 0) {
            // Upgrading

            // Grab from the nearest link, DO NOT move if needed
            const link = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return (
                        structure.structureType == STRUCTURE_LINK
                    );
                }
            });
            creep.withdraw(link, RESOURCE_ENERGY);

            // Go to the room controller, and upgrade it
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }

        if (creep.memory.status == 1) {
            // Collecting
            // Grab from the nearest link, move if needed
            const link = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return (
                        structure.structureType == STRUCTURE_LINK
                    );
                }
            });
            if(creep.withdraw(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(link, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
};

module.exports = roleLinkUpgrader;