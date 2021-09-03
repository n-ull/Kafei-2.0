const clanSchema = require('../models/clanSchema');

module.exports.join = async (member, guild) => {
	const idGroup = await clanSchema.aggregate([
		{
		  '$match': {
			'guildId': guild
		  }
		}, {
		  '$group': {
			'_id': '$roleId'
		  }
		}
	  ]);

	// Makes an array with the role ids
	const result = idGroup.map(({ _id }) => _id);

	// Calcaulates the correct index for the user id
	const selection = member.id % result.length;

	// Get all the guild clans for search an owner id
	const guildClans = await clanSchema.findOne({
		ownerId: member.id
	})

	// Check if you own a clan
	if (guildClans){
		console.log("Ya eres dueño de un clan");
		return
	}

	member.roles.add(result[ selection ]) // add the role
}

module.exports.create = async (guild, member, info) => {
	// create the clan
	let clan = await guild.roles.create({
		name: info.clanName,
		color: info.color,
		reason: `Clan comprado por ${member.displayName} - ID: ${member.id}`,
	})

	// create the entry on the database
	let newClan = new clanSchema({
		guildId: clan.guild.id,
		roleId: clan.id,
		clanName: clan.name,
		ownerId: member.id,
	}).save(console.log(`Clan comprado por ${member.displayName} - ID: ${member.id}`))

	// give the role to the owner and delete the old clan from the roles of the owner.
	const allClans = await clanSchema.aggregate([
		{
			'$match': {
				'guildId': guild.id
			}
		}, {
			'$group': {
				'_id': '$roleId'
			}
		}
	]);

	const result = allClans.map(({ _id }) => _id);

	member.roles.remove(result, "Antiguo clan quitado.");
	member.roles.add(clan, "Nuevo clan añadido");
}

module.exports.hasClan = async (userId, guildId) => {
	let result = await clanSchema.findOne({
		guildId: guildId,
		ownerId: userId
	});

	let hasClan = false

	if(result){
		hasClan = true
	}

	return hasClan
}


