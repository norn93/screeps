const LOG = true;

function spawnCreep(spawn, role, work=2, carry=1, move=1, attack=0, tough=0, claim=0) {
    
    // New spawning system based on the energy we have
    var energy = spawn.room.energyAvailable;
    const cost = {"work": 100, "carry": 50, "move": 50};
    if (role == "builder" || role == "harvester") {
        const recipe = {"work": 3, "carry": 1, "move": 2};
        var variable_cost = 0;
        for (var i in recipe) {
            variable_cost += recipe[i] * cost[i];
        }
        // console.log("Variable cost:", variable_cost);

        var x = energy/variable_cost;
        // console.log("Build factor:", x);

        // console.log("Recipe:");
        for (var i in recipe) {
            // console.log(recipe[i] * x, "of", i);
        }

        // This system doesn't quite work
    }

    var roles = ["builder", "harvester", "freight", "upgrader", "defender", "linkminer", "linkupgrader", "claimer"];
    var valid_role = roles.includes(role);
    
    if (valid_role) {
        var parts = [];
        for (var i = 0; i < tough; i++) {
            parts.push(TOUGH)
        }
        for (var i = 0; i < work; i++) {
            parts.push(WORK)
        }
        for (var i = 0; i < carry; i++) {
            parts.push(CARRY)
        }
        for (var i = 0; i < move; i++) {
            parts.push(MOVE)
        }
        for (var i = 0; i < attack; i++) {
            parts.push(ATTACK)
        }
        for (var i = 0; i < claim; i++) {
            parts.push(CLAIM)
        }
        
        var name = role + Game.time;
        if (LOG) {
            console.log("Trying to spawn a new creep with role:", role);
        }
        var result = spawn.spawnCreep(parts, name, {memory: {role: role}});
        if (result != 0) {
            if (LOG) {
                console.log("Failed:", result);
            }
        }
    } else {
        if (LOG) {
            console.log("Invalid role:", role);
        }
    }
}

module.exports = spawnCreep;