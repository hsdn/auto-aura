module.exports = function auto_auras(mod) {
	const command = mod.command;
	const AbnormalManager = require("./lib/abnormal");
	const AbnManager = new AbnormalManager(mod, false);
	let loc = null,
		wloc = null,
		timer = null,
		isMystic = false,
		isDead = false;

	command.add(["autoaura", "!autoaura"], {
		$none() {
			mod.settings.enabled = !mod.settings.enabled;
			command.message(`auto-aura ${mod.settings.enabled ? "Enabled" : "Disabled"}.`);
		},
		onrez() {
			mod.settings.onrez = !mod.settings.onrez;
			command.message(`auto-aura on rez ${mod.settings.onrez ? "Enabled" : "Disabled"}.`);
		},
		pvp() {
			mod.settings.pvp = !mod.settings.pvp;
			command.message(`auto-aura PvP ${mod.settings.pvp ? "Enabled" : "Disabled"}.`);
		},
		$default() {
			command.message("Error (typo?) in command! see README for the list of valid commands");
		}
	});

	function isEnabled() {
		return mod.settings.enabled && isMystic;
	}

	mod.game.on("enter_game", () => {
		const model = mod.game.me.templateId;
		const job = (model - 10101) % 100;
		isMystic = (job == 7);
		if (isEnabled()) {
			command.message("Enabling auto-auras");
		}
	});

	async function auras() {
		// Aura of the Merciless
		if (hasNoAbn([700600, 700601, 700602, 700603])) {
			startSkill(130400);
		}
		// Aura of the Unyielding
		if (hasNoAbn([700203, 700233]) && mod.settings.pvp) {
			startSkill(150400);
		}
		// Aura of the Tenacious
		if (hasNoAbn([700330, 700300]) && !mod.settings.pvp) {
			startSkill(160100);
		}
		// Thrall Augmentation
		if (hasNoAbn([702000, 702005])) {
			startSkill(450100);
		}
		if (!hasNoAbn([700600, 700601, 700602, 700603]) &&
			!hasNoAbn([700203, 700233, 700330, 700300]) &&
			!hasNoAbn([702000, 702005])
		) {
			mod.clearInterval(timer);
		}
	}

	function startSkill(skillId) { //not all skill types supported
		mod.toServer("C_START_SKILL", 7, {
			skill: { reserved: 0, npc: false, type: 1, huntingZoneId: 0, id: skillId },
			w: wloc,
			loc: loc,
			dest: { x: 0, y: 0, z: 0 },
			unk: true,
			moving: false,
			continue: false,
			target: 0n,
			unk2: false
		});
	}

	function hasNoAbn(ids) {
		return ids.reduce((accumulator, currentId) => accumulator && !hasAbn(currentId), true);
	}

	function hasAbn(id) {
		return ("added" in AbnManager.get(mod.game.me.gameId, id));
	}

	mod.hook("S_SPAWN_ME", 3, (event) => {
		if (mod.game.me.gameId == event.gameId) {
			loc = event.loc;
			wloc = event.w;
			if (isEnabled()) {
				mod.clearInterval(timer);
				mod.setTimeout(() => {
					timer = mod.setInterval(auras, 500);
				}, 3000);
			}
		}
	});

	mod.hook("C_PLAYER_LOCATION", 5, (event) => {
		loc = event.loc;
		wloc = event.w;
	});

	mod.hook("S_CREATURE_LIFE", 3, (event) => {
		if (isEnabled() && mod.settings.onrez) {
			if (event.gameId !== mod.game.me.gameId) return;
			loc = event.loc;
			mod.clearInterval(timer);
			if (!event.alive) {
				isDead = true;
			} else if (isDead) {
				isDead = false;
				mod.setTimeout(() => {
					startSkill(450100); // Thrall Augmentation enabling fix
					timer = mod.setInterval(auras, 500);
				}, 3000);
			}
		}
	});
};
