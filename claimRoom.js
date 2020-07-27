function claimRoom() {
    console.log("Running room claimer...");

    var flags = Game.flags;

    const claimer_setpoint = 1;

    for (var i in flags) {
        var flag = flags[i];

        console.log("Flag:", flag);
        console.log("  - name:", flag.name);
        console.log("  - position:", flag.pos);

        if (flag.name == "RESERVE") {
            console.log("  - We need to reserve this");

            // Cache the path from spawn to the flag #CPU
            if (!flag.memory.path_from_spawn) {
                flag.memory.path_from_spawn = PathFinder.search(Game.spawns['Spawn1'].pos, flag.pos);
            }
            
            var path_distance = flag.memory.path_from_spawn.cost;

            console.log("  - distance:", path_distance);
        }
    }
}

module.exports = claimRoom;