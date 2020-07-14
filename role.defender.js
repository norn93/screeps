var roleDefender = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Choose creep state
        if(creep.memory.defending && Game.spawns['Spawn1'].memory.roomAttacked == false) {
            creep.memory.defending = false;
            creep.say("Peace");
        }
        if(!creep.memory.defending && Game.spawns['Spawn1'].memory.roomAttacked == true) {
            creep.memory.defending = true;
            creep.say("Defending!");
        }

        if(creep.memory.defending) {
            // Find targets to attack
            nearest_hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

            // Go to them
            // Attack them
            if(creep.attack(nearest_hostile) == ERR_NOT_IN_RANGE) {
                creep.moveTo(nearest_hostile, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        } else {
            if (creep.ticksToLive > 1400) {
                // Go to a rampart
                var rampart = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            structure.structureType == STRUCTURE_RAMPART
                        );
                    }
                });
                if(creep.moveTo(rampart) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(rampart, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                // Time to die
                // Go to a container
                var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            structure.structureType == STRUCTURE_CONTAINER
                        );
                    }
                });
                if(creep.moveTo(container) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, {visualizePathStyle: {stroke: '#ffffff'}});
                } else {
                    Game.spawns['Spawn1'].recycleCreep(creep);
                }

            }
        }
    }
};

module.exports = roleDefender;