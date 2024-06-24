// SPDX-FileCopyrightText: 2023 Matheus Clemente
//
// SPDX-License-Identifier: MIT

class ImprovedPlayerList extends PlayerList {
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

Hooks.once("init", () => {
	CONFIG.ui.players = ImprovedPlayerList;
})

Hooks.once("ready", () => {
	const userConfigList = Users.registeredSheets;
	let userConfig = userConfigList[0];
	if (userConfigList.length > 1) {
		userConfig = userConfigList.find((uc) => Users.registeredSheets[0].name !== "UserConfig");
	}

	class ImprovedUserConfig extends userConfig {
		// While the original getData isn't async, some system might change that (e.g. PF2e)
		async getData(options = {}) {
			const data = await super.getData(options);
			const charname = this.object.isGM ? game.i18n.localize("USER.GM") : this.object.character?.name.split(" ")[0] || "";
			const flag = this.object.flags["improved-player-list"]?.charname ?? "";
			return {
				...data,
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

	Users.registerSheet("improved-player-list", ImprovedUserConfig, {
		makeDefault: true,
		label: `Improved Player List: ${game.i18n.format("SHEETS.DefaultDocumentSheet", { document: game.i18n.localize("DOCUMENT.User") })}`
	});
});

Hooks.on("renderUserConfig", (userConfig, html, data) => {
	const playerColorField = html.find(".form-group input[name='color']").closest(".form-group");
	const { charname, flag } = data;
	playerColorField.after(
		`<div class="form-group">
			<label>${game.i18n.localize("Name")}</label>
			<div class="form-fields">
				<input type="text" name="flags.improved-player-list.charname" placeholder="${charname ?? ""}" value="${flag ?? ""}">
			</div>
		</div>`
		);
	userConfig.setPosition();
});