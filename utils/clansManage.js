const clanSchema = require('../models/clanSchema');

module.exports = { join, create, hasClan, forceJoin };

async function join(member, guild) {
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
	const result = idGroup.map(({ _id }) => _id).sort((a, b) => a - b);

	// Calcaulates the correct index for the user id
	const selection = member.id % result.length;

	// Get all the guild clans for search an owner id
	const guildClans = await clanSchema.findOne({
		ownerId: member.id
	})

	// Error Handler
	if (guildClans) throw 'Ya eres dueño de un clan.';
	if (member.roles.cache.has(result[ selection ])) throw 'Estás en el clan que perteneces';
	if (!result.length == 0) throw 'No existe ningún clan al que unirse.';

	// Give clan
	member.roles.remove(result, 'Clan Removed').then(
		() => {
			member.roles.add(result[ selection ], 'Clan Added');
		}
	); // add the role
	return 'Ya tienes tu nuevo clan, imbécil'
}

async function create(guild, member, info) {
	// create the clan
	let clan = await guild.roles.create({
		name: `「${info.emoji}」${info.name}`,
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

async function hasClan(userId, guildId) {
	let result = await clanSchema.findOne({
		guildId: guildId,
		ownerId: userId
	});

	let hasClan = false

	if (result) {
		hasClan = true
	}

	return hasClan
}

async function forceJoin(member, clan) {

};