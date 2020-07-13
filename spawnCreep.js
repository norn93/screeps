function spawnCreep(role, work, carry, move) {
    console.log("Spawning a new creep with role:", role);
    var roles = ["builder", "harvester", "freight", "upgrader"];
    var valid_role = roles.includes(role);
    if (valid_role) {
        console.log(role, "is a valid role!");
        var parts = [];
        for (var i = 0; i <= work; i++) {
            parts.push(WORK)
        }
        for (var i = 0; i <= carry; i++) {
            parts.push(CARRY)
        }
        for (var i = 0; i <= move; i++) {
            parts.push(MOVE)
        }
        console.log("Parts:", parts);
        var name = role + Game.time;
        console.log("Name:", name);
    } else {
        console.log(role, "is not a valid role");
    }
}

module.exports = spawnCreep;