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
        
            // Do we already have the room?
            if (flag.room) {
                if (flag.room.controller.my) {
                    console.log("  - We already own this room");
                    continue;
                }
            }

            console.log("  - We need to reserve this");

            claimer_setpoint += 1;
        }
    }

    if (claimers.length < claimer_setpoint) {
        spawnCreep("claimer", 0, 0, 2, 0, 0, 1);
    }
}

module.exports = claimRoom;