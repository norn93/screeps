var spawnCreep = require('spawnCreep');

const LOG = false;

function claimRoom() {
    if (LOG) {
        console.log("Running room claimer...");
    }

    var flags = Game.flags;

    var claimer_setpoint = 0;

    var claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer');

    if (LOG) {
       console.log('Claimers: ' + claimers.length);
    }

    for (var i in flags) {
        var flag = flags[i];

        if (LOG) {
            console.log("Flag:", flag);
            console.log("  - name:", flag.name);
            console.log("  - position:", flag.pos);
            console.log("  - room:", flag.room);
        }

        if (flag.name == "CLAIM") {
        
            // Do we already have the room?
            if (flag.room) {
                if (flag.room.controller.my) {
                    if (LOG) {
                        console.log("  - We already own this room");
                    }
                    continue;
                }
            }

            if (LOG) {
                console.log("  - We need to reserve this");
            }

            claimer_setpoint += 1;
        }
    }

    if (claimers.length < claimer_setpoint) {
        spawnCreep(Game.spawns['Spawn1'].room, "claimer", 0, 0, 4, 0, 0, 1);
    }
}

module.exports = claimRoom;