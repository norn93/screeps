function linkNetwork() {
    console.log("Running link network...");

    var links = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (
                structure.structureType == STRUCTURE_LINK
            );
        }
    });

    // Sort the links into types
    var senders = [];
    var receivers = []
    for (var i in links) {
        var link = links[i];

        // Now, we can programatically work out what kind of link this is
        // If the link is close to a source, then it's job is to forward to the other link/s
        // that are not near sources i.e. the link is a sender.

        // If the link is not close to a source, then it must be a reciever or a station
        // Recievers don't really need to do anything, stations might have rules

        var closest_source = link.pos.findInRange(FIND_SOURCES, 3);

        // console.log("Closest:", closest_source);
        // console.log("Null?:", closest_source == null);
        // console.log("No list?:", closest_source == []);
        // console.log("False:", closest_source == false);

        if (closest_source != false) {
            // Then we are a sender
            // If we are full, transfer as many units as will fit into the reciever
            senders.push(link);
        } else {
            // We might be a reciever
            receivers.push(link);
        }
    }

    // Now, each sender should try to send to a reciever
    for (var i in senders) {
        var sender = senders[i];
        console.log(sender, "should try to send to one of:");
        for (var j in receivers) {
            var receiver = receivers[j];
            console.log(" -", reciever);
        }
    }
}

module.exports = linkNetwork;