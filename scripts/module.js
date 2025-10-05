Hooks.once("init", () => {
	const origPlayerList = CONFIG.ui.players;
	class ImprovedPlayerList extends origPlayerList {
		_formatName(user) {
			const displayNamePart = [user.name];
			if (user.pronouns) displayNamePart.push(`(${user.pronouns})`);
			const flag = user.flags["improved-player-list"]?.charname;
			if (flag) displayNamePart.push(`[${flag}]`);
			else if (user.isGM) displayNamePart.push(`[${game.i18n.localize("USER.GM")}]`);
			else if (user.charname) displayNamePart.push(`[${user.character.name}]`);
			return displayNamePart.join(" ");
		}
	}

	CONFIG.ui.players = ImprovedPlayerList;
})

function createForm(charname, flag) {
	const formGroup = document.createElement("div");
	formGroup.className = "form-group";

	const label = document.createElement("label");
	label.textContent = game.i18n.localize("Name");

	const formFields = document.createElement("div");
	formFields.className = "form-fields";

	const input = document.createElement("input");
	input.type = "text";
	input.name = "flags.improved-player-list.charname";
	input.placeholder = charname;
	input.value = flag;

	const hint = document.createElement("p");
	hint.className = "hint";
	hint.textContent = game.i18n.localize("IMPROVED-PLAYER-LIST.configure-name.hint");

	// Append elements
	formFields.appendChild(input);
	formGroup.appendChild(label);
	formGroup.appendChild(formFields);
	formGroup.appendChild(hint);

	return formGroup;
}

Hooks.on("renderUserConfig", (userConfig, form) => {
	const charname = userConfig.document.isGM ? game.i18n.localize("USER.GM") : userConfig.document.character?.name.split(" ")[0] || "";
	const flag = userConfig.document.flags["improved-player-list"]?.charname ?? "";

	const playerColorField = form.querySelector("color-picker[name='color']").closest(".form-group");
	playerColorField.after(createForm(charname, flag));

	if (!userConfig.document.isGM) {
		userConfig.element.querySelector("select[name=character]").addEventListener("change", (ev) => {
			const input = userConfig.element.querySelector(`input[name="flags.improved-player-list.charname"]`);
			const actorId = ev.currentTarget.value;
			const charname = game.actors.get(actorId)?.name;
			input.placeholder = charname?.split(" ")[0] ?? "";
		});
	}
});

Hooks.on("closeUserConfig", () => ui.players.render(true));
