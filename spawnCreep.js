function spawnCreep(role, work=2, carry=1, move=1) {
    var roles = ["builder", "harvester", "freight", "upgrader"];
    var valid_role = roles.includes(role);
    if (valid_role) {
        var parts = [];
        for (var i = 0; i < work; i++) {
            parts.push(WORK)
        }
        for (var i = 0; i < carry; i++) {
            parts.push(CARRY)
        }
        for (var i = 0; i < move; i++) {
            parts.push(MOVE)
        }
        var name = role + Game.time;
        console.log("Spawning a new creep with role:", role);
        Game.spawns['Spawn1'].spawnCreep(parts, name, {memory: {role: role}});
    }
}

module.exports = spawnCreep;