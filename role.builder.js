var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Choose creep state
        if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
        }
        if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            creep.memory.building = true;
        }

        // Check if there's a storage with over 300k energy
        var storage = false
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_STORAGE);
            }
        });
        if(targets.length) {
            storage = true;
        }

        if(creep.memory.building) {
            var targets = []
            for (var i in Game.rooms) { // Search in all rooms, find any target
                var room = Game.rooms[i];
                var this_room_targets = room.find(FIND_CONSTRUCTION_SITES);
                if (this_room_targets.length) {
                    targets = this_room_targets;
                }
            }
            if(targets.length) {
                // We should build
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                // We should store the resources
                var new_targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                if (!new_targets.length) {
                    new_targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (
                                structure.structureType == STRUCTURE_STORAGE) &&
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                        }
                    });
                }
                if(new_targets.length) {
                    if(creep.transfer(new_targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(new_targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
        }
        else {
            // Get energy
            if (storage) {
                // We can get energy from storage
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE);
                    }
                });
                if(targets.length) {
                    if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            } else {
                // We need to harvest
                var source = creep.pos.findClosestByPath(FIND_SOURCES);
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
    }
};

module.exports = roleBuilder;