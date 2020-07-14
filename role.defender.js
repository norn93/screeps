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
            // Find the creep with the most healing parts
            // var hostiles = Game.spawns['Spawn1'].room.find(FIND_HOSTILE_CREEPS);
            // var max_healing_parts = 0;
            // var worst_hostile = hostiles[0];
            // for(var i in hostiles) {
            //     var hostile = hostiles[i];
            //     var healing_parts = 0;
            //     var body_contents = hostile.body;
            //     for (var body_element in body_contents) {
            //         var this_part = body_contents[body_element]["type"]
            //         if (this_part == "heal") {
            //             healing_parts += 1;
            //         }
            //     }
            //     if (healing_parts > max_healing_parts) {
            //         worst_hostile = hostile;
            //     }
            // }
            worst_hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

            // Go to them
            // Attack them
            if(creep.attack(worst_hostile) == ERR_NOT_IN_RANGE) {
                creep.moveTo(worst_hostile, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        } else {
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
        }
    }
};

module.exports = roleDefender;