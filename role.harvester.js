var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep, spawn) {

        // If we're at least partly empty, harvest
        if(creep.store.getFreeCapacity() > 0) {
            var source = creep.pos.findClosestByPath(FIND_SOURCES); // Find the closest source
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        } else {
            var freights = _.filter(Game.creeps, (creep) => creep.memory.role == 'freight' && creep.room == room);

            if (freights.length) {
                // If we have freights, then just fill up the storage
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            structure.structureType == STRUCTURE_STORAGE) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
            } else {
                // We don't have freights, so fill up spawn
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_TOWER ||
                            structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                }); 
            }
                
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    }
};

module.exports = roleHarvester;