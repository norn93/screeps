var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {

        creep.say("?");
        
        var flags = Game.flags;

        for (var i in flags) {
            var flag = flags[i];

            if (flag.room) {
                console.log("Flag has a room");
                if (creep.claimController(flag.room.controller) == ERR_NOT_IN_RANGE) {
                    console.log("Moving toeards flag");
                    creep.moveByPath(flag.memory.path_from_spawn);
                }
            } else {
                var result = creep.moveByPath(flag.memory.path_from_spawn);
                console.log("Result of move:", result);
            }
        }
    }
};

module.exports = roleClaimer;