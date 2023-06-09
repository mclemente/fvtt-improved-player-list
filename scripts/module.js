// SPDX-FileCopyrightText: 2023 Matheus Clemente
//
// SPDX-License-Identifier: MIT

Hooks.once("init", function () {
	// Player List
	libWrapper.register(
		"improved-player-list",
		"PlayerList.prototype.getData",
		function (wrapped, options = {}) {
			const wrappedObject = wrapped((options = {}));
			wrappedObject.users = game.users
				.filter((u) => this._showOffline || u.active)
				.map((user) => {
					const u = user.toObject(false);
					const charname = user.isGM ? game.i18n.localize("USER.GM") : user.character?.name.split(" ")[0] || "";
					const flag = user.flags["improved-player-list"]?.charname;

					u.active = user.active;
					u.isGM = user.isGM;
					u.isSelf = user.isSelf;
					u.charname = flag || charname;
					u.color = u.active ? u.color : "#333333";
					u.border = u.active ? user.border : "#000000";
					u.displayName = this._getDisplayName(u);
					return u;
				})
				.sort((a, b) => {
					if (b.role >= CONST.USER_ROLES.ASSISTANT && b.role > a.role) return 1;
					return a.name.localeCompare(b.name);
				});
			return { ...wrappedObject };
		},
		"WRAPPER"
	);
	libWrapper.register(
		"improved-player-list",
		"PlayerList.prototype._getDisplayName",
		function (user) {
			const displayNamePart = [user.name];
			if (user.pronouns) displayNamePart.push(`(${user.pronouns})`);
			const flag = user.flags["improved-player-list"]?.charname;
			if (flag) displayNamePart.push(`[${flag}]`);
			else if (user.isGM) displayNamePart.push(`[${game.i18n.localize("USER.GM")}]`);
			else if (user.charname) displayNamePart.push(`[${user.charname}]`);
			return displayNamePart.join(" ");
		},
		"OVERRIDE"
	);
	libWrapper.register(
		"improved-player-list",
		"UserConfig.prototype.getData",
		function (wrapped, options = {}) {
			const charname = this.object.isGM ? game.i18n.localize("USER.GM") : this.object.character?.name.split(" ")[0] || "";
			const flag = this.object.flags["improved-player-list"]?.charname ?? "";
			return {
				...wrapped(options),
				charname,
				flag,
			};
		},
		"WRAPPER"
	);

	// User Config
	libWrapper.register(
		"improved-player-list",
		"UserConfig.defaultOptions",
		function (wrapped) {
			return foundry.utils.mergeObject(wrapped(), {
				template: "./modules/improved-player-list/templates/user-config.html",
			});
		},
		"WRAPPER"
	);
	libWrapper.register(
		"improved-player-list",
		"UserConfig.prototype.activateListeners",
		function (wrapped, html) {
			wrapped(html);
			if (!this.object.isGM) {
				html.find(".actor").click((ev) => {
					let input = html.find(`input[name="flags.improved-player-list.charname"]`);
					let li = ev.currentTarget;
					let actorId = li.getAttribute("data-actor-id");
					const charname = game.actors.get(actorId)?.name;
					input.attr("placeholder", charname.split(" ")[0]);
				});
			}
		},
		"WRAPPER"
	);
});
