function linkNetwork() {
    console.log("Running link network...");

    var links = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (
                structure.structureType == STRUCTURE_LINK
            );
        }
    });

    for (var i in links) {
        var link = links[i];
        console.log(link);
    }
}

module.exports = linkNetwork;