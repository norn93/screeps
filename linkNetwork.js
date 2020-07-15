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

        // Now, we can programatically work out what kind of link this is
        // If the link is close to a source, then it's job is to forward to the other link/s
        // that are not near sources i.e. the link is a sender.

        // If the link is not close to a source, then it must be a reciever.
        // Recievers don't really need to do anything

        var closest_source = link.pos.findInRange(FIND_SOURCES);

        console.log("Distance to source:", closest_source);
    }
}

module.exports = linkNetwork;