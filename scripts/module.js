// SPDX-FileCopyrightText: 2023 Matheus Clemente
//
// SPDX-License-Identifier: MIT

class ImprovedPlayerList extends PlayerList {
	getData(options={}) {
		const users = game.users.filter((u) => this._showOffline || u.active).map((user) => {
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
		}).sort((a, b) => {
			if ( (b.role >= CONST.USER_ROLES.ASSISTANT) && (b.role > a.role) ) return 1;
			return a.name.localeCompare(b.name);
		});
		return {
			users,
			hide: this.isHidden,
			showOffline: this._showOffline
		};
	}

	_getDisplayName(user) {
		const displayNamePart = [user.name];
		if (user.pronouns) displayNamePart.push(`(${user.pronouns})`);
		const flag = user.flags["improved-player-list"]?.charname;
		if (flag) displayNamePart.push(`[${flag}]`);
		else if (user.isGM) displayNamePart.push(`[${game.i18n.localize("USER.GM")}]`);
		else if (user.charname) displayNamePart.push(`[${user.charname}]`);
		return displayNamePart.join(" ");
	}
}

class ImprovedUserConfig extends UserConfig {
	getData(options = {}) {
		const controlled = game.users.reduce((arr, u) => {
			if ( u.character ) arr.push(u.character);
			return arr;
		}, []);
		const actors = game.actors.filter(a => a.testUserPermission(this.object, "OBSERVER") && !controlled.includes(a.id));
		const charname = this.object.isGM ? game.i18n.localize("USER.GM") : this.object.character?.name.split(" ")[0] || "";
		const flag = this.object.flags["improved-player-list"]?.charname ?? "";
		return {
			user: this.object,
			actors: actors,
			options: this.options,
			charname,
			flag
		};
	}

	activateListeners(html) {
		super.activateListeners(html);
		if (!this.object.isGM) {
			html.find(".actor").click((ev) => {
				const input = html.find(`input[name="flags.improved-player-list.charname"]`);
				const li = ev.currentTarget;
				const actorId = li.getAttribute("data-actor-id");
				const charname = game.actors.get(actorId)?.name;
				input.attr("placeholder", charname.split(" ")[0]);
			});
		}
	}
}

Hooks.once("i18nInit", () => {
	CONFIG.ui.players = ImprovedPlayerList;
	Users.registerSheet("improved-player-list", ImprovedUserConfig, {
		makeDefault: true,
		label: `Improved Player List: ${game.i18n.localize(`DOCUMENT.User`)}`
	});
});

Hooks.on("renderUserConfig", (userConfig, html, data) => {
	const playerColorField = html.find(".form-group input[name='color']").closest(".form-group");
	playerColorField.after(
		`<div class="form-group">
			<label>${game.i18n.localize("Name")}</label>
			<div class="form-fields">
				<input type="text" name="flags.improved-player-list.charname" placeholder="${data.charname}" value="${data.flag}">
			</div>
		</div>`
		);
	userConfig.setPosition();
});