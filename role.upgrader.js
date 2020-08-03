var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Get this room's spawn
        const spawn = creep.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_SPAWN }
        })[0];

        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
        }
        if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
            creep.memory.upgrading = true;
        }

        if (creep.memory.upgrading) {
            if (creep.pos.inRangeTo(creep.room.controller, 3)) {
                creep.upgradeController(creep.room.controller);
            } else {
                creep.moveTo(creep.room.controller,
                    {
                        visualizePathStyle: {stroke: '#ffffff'},
                        reusePath: 5
                    });
            }
        } else {
            var source = creep.pos.findClosestByRange(FIND_SOURCES);
            if (creep.pos.isNearTo(source)) {
                creep.harvest(source);
            } else {
                creep.moveTo(source,
                    {
                        visualizePathStyle: {stroke: '#ffffff'},
                        reusePath: 5
                    });
            }
        }
    }
};

module.exports = roleUpgrader;