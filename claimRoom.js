var spawnCreep = require('spawnCreep');

function claimRoom() {
    console.log("Running room claimer...");

    var flags = Game.flags;

    var claimer_setpoint = 0;

    var claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer');
    console.log('Claimers: ' + claimers.length);

    for (var i in flags) {
        var flag = flags[i];

        console.log("Flag:", flag);
        console.log("  - name:", flag.name);
        console.log("  - position:", flag.pos);
        console.log("  - room:", flag.room);

        if (flag.name == "CLAIM") {
            console.log("  - We need to reserve this");

            claimer_setpoint += 1;

            // Cache the path from spawn to the flag #CPU
            if (!flag.memory.path_from_spawn) {
                flag.memory.path_from_spawn = PathFinder.search(Game.spawns['Spawn1'].pos, flag.pos);
            }
            
            var path_distance = flag.memory.path_from_spawn.cost;

            console.log("  - distance:", path_distance);
        }
    }

    if (claimers.length < claimer_setpoint) {
        spawnCreep("claimer", 0, 0, 1);
    }
}

module.exports = claimRoom;