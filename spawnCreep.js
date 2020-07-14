function spawnCreep(role, work=2, carry=1, move=1, attack=0, tough=0) {
    var roles = ["builder", "harvester", "freight", "upgrader", "defender"];
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

        var name = role + Game.time;
        console.log("Spawning a new creep with role:", role);
        var result = Game.spawns['Spawn1'].spawnCreep(parts, name, {memory: {role: role}});
        console.log(result);
    }
}

module.exports = spawnCreep;