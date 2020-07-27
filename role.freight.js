var roleFreight = {

    /** @param {Creep} creep **/
    run: function(creep, spawn) {

        var total_stored_energy = 0;
        var storage = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_STORAGE);
            }
        });
        if (storage.length) {
            total_stored_energy = storage[0].store.getUsedCapacity(RESOURCE_ENERGY);
        }
    
        // If we're about to die, then drop everythig into the storage and suicide
        if(creep.ticksToLive < 25) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE);
                }
            });
            if(targets.length) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            if(creep.store.getFreeCapacity() == creep.store.getCapacity()) {
                creep.suicide();   
            }
            return;
        }

        // If we're empty, or nearly empty, refill
        if(creep.store.getFreeCapacity() == creep.store.getCapacity()) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE);
                }
            });
            if(targets.length > 0) {
                if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        } else {
            //Once full...
            //If we're being attacked, then focus on towers that are missing some energy
            if (spawn.memory.roomAttacked) {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0.5 * structure.store.getCapacity(RESOURCE_ENERGY);
                    }
                });
                if (targets.length == 0) {
                    // Then we can afford to work on those extensions
                    targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (
                                structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN) &&
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                        }
                    });
                }
            } else {
                // If we're not being attacked, then fill up extensions and spawn
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                // ...then links (if we have a good amount of energy)
                if (targets.length == 0 && total_stored_energy > 500000) {
                    targets = creep.pos.findInRange(FIND_STRUCTURES, 10, {
                        filter: (structure) => {
                            return (
                                structure.structureType == STRUCTURE_LINK) &&
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                        }
                    });
                }
                // ...and if they're all full, THEN fill up towers
                if (targets.length == 0) {
                    targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (
                                structure.structureType == STRUCTURE_TOWER) &&
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0.5 * structure.store.getCapacity(RESOURCE_ENERGY);
                        }
                    });
                }
            }
            // Do the actual moving
            if(targets.length) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                // If there's nothing at all to do, then just fill up 
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
            }
        }
    }
};

module.exports = roleFreight;