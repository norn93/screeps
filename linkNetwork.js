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
    var transfers = []
    for (var i in links) {
        var link = links[i];

        // Now, we can programatically work out what kind of link this is
        // If the link is close to a source, then it's job is to forward to the other link/s
        // that are not near sources i.e. the link is a sender.

        // If the link is not close to a source, then it must be a receiver or a station
        // Recievers don't really need to do anything, stations might have rules

        var closest_source = link.pos.findInRange(FIND_SOURCES, 2);

        var closest_storage = link.pos.findInRange(FIND_STRUCTURES, 2, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_STORAGE);
            }
        });

        // console.log("Closest:", closest_source);
        // console.log("Null?:", closest_source == null);
        // console.log("No list?:", closest_source == []);
        // console.log("False:", closest_source == false);

        if (closest_source != false) {
            // Then we are a sender
            // If we are full, transfer as many units as will fit into the receiver
            senders.push(link);
        } else if (closest_storage != false) {
            // Then we are a transferer
            transfers.push(link);
        } else {
            // We might be a receiver
            receivers.push(link);
        }
    }

    // Now, each sender should try to send to a receiver if that receiver is less than half full
    for (var i in senders) {
        var sender = senders[i];
        console.log(sender, "should try to send to one of:");
        var sent_to_receiver = false;
        for (var j in receivers) {
            var receiver = receivers[j];
            var energy = receiver.store.getUsedCapacity(RESOURCE_ENERGY);
            var energy_max = receiver.store.getCapacity(RESOURCE_ENERGY);
            console.log(" -", receiver, "with", energy, "out of", energy_max, "energy.");
            if (energy < energy_max) {
                sender.transferEnergy(receiver);
                sent_to_receiver = true;
            }
        }
        // Else, we should send to a transfer
        if (!sent_to_receiver) {
            for (var j in transfers) {
                var transfer = transfers[j];
                var energy = transfer.store.getUsedCapacity(RESOURCE_ENERGY);
                var energy_max = transfer.store.getCapacity(RESOURCE_ENERGY);
                console.log(" -", transfer, "with", energy, "out of", energy_max, "energy.");
                if (energy < 0.5 * energy_max) {
                    sender.transferEnergy(transfer);
                }
            }
        }
    }

    // Each transfer whould try to also send to a reciever
    for (var i in transfers) {
        var transfer = transfers[i];
        console.log(transfer, "should try to send to one of:");
        for (var j in receivers) {
            var receiver = receivers[j];
            var energy = receiver.store.getUsedCapacity(RESOURCE_ENERGY);
            var energy_max = receiver.store.getCapacity(RESOURCE_ENERGY);
            console.log(" -", receiver, "with", energy, "out of", energy_max, "energy.");
            if (energy < 0.5 * energy_max) {
                transfer.transferEnergy(receiver);
            }
        }
    }
}

module.exports = linkNetwork;