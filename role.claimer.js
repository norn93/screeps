var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep, spawn) {
        
        var flags = Game.flags;

        for (var i in flags) {
            var flag = flags[i];

            if (flag.room) {
                console.log("Flag has a room");
                if (creep.claimController(flag.room.controller) == ERR_NOT_IN_RANGE) {
                    console.log("Moving towards flag");
                    creep.moveTo(flag);
                } else {
                    console.log("Some weird error: maybe this creep can't claim?");
                }
            } else {
                var result = creep.moveTo(flag);
                console.log("Result of move:", result);
            }
        }
    }
};

module.exports = roleClaimer;