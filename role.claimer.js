var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        var flags = Game.flags;

        for (var i in flags) {
            var flag = flags[i];

            if (flag.room) {
                if (creep.claimController(flag.room.controller) == ERR_NOT_IN_RANGE) {
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