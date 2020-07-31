var roleTower = {

    /** @param {Creep} creep **/
    run: function(tower) {

        // Get this room's spawn
        const spawn = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_SPAWN }
        })[0];

        if (spawn.memory.roomAttacked) {

            // Find the creep with the most healing parts
            var hostiles = spawn.room.find(FIND_HOSTILE_CREEPS);
            var max_healing_parts = 0;
            var worst_hostile = hostiles[0];
            for(var i in hostiles) {
                var hostile = hostiles[i];
                var healing_parts = 0;
                var body_contents = hostile.body;
                for (var body_element in body_contents) {
                    var this_part = body_contents[body_element]["type"]
                    if (this_part == "heal") {
                        healing_parts += 1;
                    }
                }
                if (healing_parts > max_healing_parts) {
                    worst_hostile = hostile;
                }
            }

            // Attack that creep
            tower.attack(worst_hostile);

        } else {
            // We're not being attacked
            
            // Find closest damaged non defensive structure
            var structureToRepair = spawn.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (
                        structure.hits < structure.hitsMax &&
                        structure.structureType != STRUCTURE_WALL &&
                        structure.structureType != STRUCTURE_RAMPART
                    );
                }
            });

            if (structureToRepair.length == 0) {
                // Then we should repair a wall or rampart
                var structureToRepair = spawn.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            structure.hits < spawn.memory.wallHealth &&
                            (structure.structureType == STRUCTURE_WALL ||
                            structure.structureType == STRUCTURE_RAMPART)
                        );
                    }
                });

                // If that still returns nothing, then we should check the storage
                // If it's reasonably full, then let's increase the wall limit by 1k
                if (structureToRepair.length == 0) {
                    var total_storage = 0;
                    var storages = spawn.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_STORAGE)
                        }
                    });
                    for (var n in storages) {
                        var storage = storages[n];
                        total_storage += storage.store.getUsedCapacity();
                    }
                    if (total_storage > 250000) {
                        spawn.memory.wallHealth += 1000;
                        spawn.memory.wallHealth = Math.min(spawn.memory.wallHealth, 100000);
                    }
                }

            }

            // Repair the weakest structure
            if(structureToRepair.length) {
                var min_health = structureToRepair[0].hits;
                var most_hurt_structure;
                for (var i in structureToRepair) {
                    var this_structure = structureToRepair[i];
                    if (this_structure.hits <= min_health) {
                        min_health = this_structure.hits;
                        most_hurt_structure = this_structure;
                    }
                }
                tower.repair(most_hurt_structure);
            }
        }
    }
}

module.exports = roleTower;