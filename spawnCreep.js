function spawnCreep(role, availableEnergy) {
    console.log("Spawning a new creep with role:", role, "and", availableEnergy, "energy available.");
    var roles = ["builder", "harvester", "freight", "upgrader"];
    var valid_role = roles.includes(role);
    if (valid_role) {
        console.log(role, "is a valid role!");
    } else {
        console.log(role, "is not a valid role");
    }
}

module.exports = spawnCreep;