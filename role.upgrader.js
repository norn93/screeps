var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep, spawn) {

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
                        reusePath: 50
                    });
            }
        } else {
            var source = creep.pos.findClosestByPath(FIND_SOURCES);
            if (creep.pos.isNearTo(source)) {
                creep.harvest(source);
            } else {
                creep.moveTo(source,
                    {
                        visualizePathStyle: {stroke: '#ffffff'},
                        reusePath: 50
                    });
            }
        }
    }
};

module.exports = roleUpgrader;