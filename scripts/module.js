// SPDX-FileCopyrightText: 2023 Matheus Clemente
//
// SPDX-License-Identifier: MIT

Hooks.once("init", function () {
	// Player List
	libWrapper.register(
		"improvedPlayerList",
		"PlayerList.defaultOptions",
		function (wrapped) {
			return foundry.utils.mergeObject(wrapped(), {
				template: "./modules/improvedPlayerList/templates/players.html",
			});
		},
		"WRAPPER"
	);
	libWrapper.register(
		"improvedPlayerList",
		"PlayerList.prototype.getData",
		function (wrapped, options = {}) {
			const wrappedObject = wrapped((options = {}));
			wrappedObject.users = game.users
				.filter((u) => this._showOffline || u.active)
				.map((user) => {
					const u = user.toObject(false);
					const charname = user.isGM ? "GM" : user.character?.name.split(" ")[0] || "";
					const flag = user.flags["improvedPlayerList"]?.charname;

					u.active = user.active;
					u.isGM = user.isGM;
					u.isSelf = user.isSelf;
					u.charname = flag || charname;
					u.color = u.active ? u.color : "#333333";
					u.border = u.active ? user.border : "#000000";
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
		"improvedPlayerList",
		"UserConfig.prototype.getData",
		function (wrapped, options = {}) {
			const charname = this.object.isGM ? "GM" : this.object.character?.name.split(" ")[0] || "";
			const flag = this.object.flags["improvedPlayerList"]?.charname ?? "";
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
		"improvedPlayerList",
		"UserConfig.defaultOptions",
		function (wrapped) {
			return foundry.utils.mergeObject(wrapped(), {
				template: "./modules/improvedPlayerList/templates/user-config.html",
			});
		},
		"WRAPPER"
	);
	libWrapper.register(
		"improvedPlayerList",
		"UserConfig.prototype.activateListeners",
		function (wrapped, html) {
			wrapped(html);
			if (!this.object.isGM) {
				html.find(".actor").click((ev) => {
					let input = html.find(`input[name="flags.improvedPlayerList.charname"]`);
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
