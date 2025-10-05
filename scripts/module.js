Hooks.once("init", () => {
	const origPlayerList = CONFIG.ui.players;
	class ImprovedPlayerList extends origPlayerList {
		_formatName(user) {
			const parts = [user.name];
			if (user.pronouns) parts.push(`(${user.pronouns})`);
			const flag = user.flags["improved-player-list"]?.charname;
			if (flag) parts.push(`[${flag}]`);
			else if (user.isGM) parts.push(`[${game.i18n.localize("USER.GM")}]`);
			else if (user.character) parts.push(`[${user.character.name}]`);
			return parts.join(" ");
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
	const { document: doc, element } = userConfig;
	const charname = doc.isGM ? game.i18n.localize("USER.GM") : (doc.character?.name ?? "");
	const flag = doc.flags["improved-player-list"]?.charname ?? "";

	const playerColorField = form.querySelector("color-picker[name='color']").closest(".form-group");
	playerColorField.after(createForm(charname, flag));

	if (!doc.isGM) {
		const input = element.querySelector(`input[name="flags.improved-player-list.charname"]`);
		element.querySelector("select[name=character]").addEventListener("change", (ev) => {
			const actorId = ev.currentTarget.value;
			input.placeholder = game.actors.get(actorId)?.name ?? "";
		});
		element.querySelector("button[data-action=releaseCharacter]")?.addEventListener("click", (ev) => {
			input.placeholder = "";
		});
	}
});
