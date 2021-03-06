const LOG = false;

var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        var flags = Game.flags;

        for (var i in flags) {
            var flag = flags[i];

            if (flag.room) {
                if (LOG) {
                    console.log("Flag has a room");
                }
                if (creep.claimController(flag.room.controller) == ERR_NOT_IN_RANGE) {
                    if (LOG) {
                        console.log("Moving towards flag");
                    }
                    creep.moveTo(flag);
                } else {
                    if (LOG) {
                        console.log("Some weird error: maybe this creep can't claim?");
                    }
                }
            } else {
                var result = creep.moveTo(flag);
                if (LOG) {
                    console.log("Result of move:", result);
                }
            }
        }
    }
};

module.exports = roleClaimer;