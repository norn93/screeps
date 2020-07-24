function claimRoom() {
    console.log("Running room claimer...");

    var flags = Game.flags;

    for (var i in flags) {
        var flag = flags[i];

        console.log("Flag:", flag);
        console.log("  - name:", flag.name);
        console.log("  - room:", flag.room);
        console.log("  - position:", flag.pos);

        if (flag.name == "RESERVE") {
            console.log("  - We need to reserve this");
        }
    }
}

module.exports = claimRoom;