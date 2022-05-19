/*
	*eom*
*/

function parse_EoM_json(data, key_id) {
	let mapData = new Map();
	data.forEach((item) => {
		mapData.set(item[key_id], item);
	});
	return mapData;
}

function parse_masterAttackLabel(data, mapData = new Map()) {
	//let mapData = new Map();
	let regex = /^AttackLabel/;
	data.forEach((item) => {
		for (const [label, value] of Object.entries(item)) {
			// Check only AttackLabelXX
			if (label.match(regex)) {
				if (value != 0) {
					mapData.set(value, item["MasterCharacterId"]);
				}
			}
		}
	});
	return mapData;
}


/*
	Parse a json file from folder 'en', the key parameter value become the key in the result
	ex unitName["UN_LW_P_MONT"] => {"key"=>"UN_LW_P_MONT", "value"=>"Mont Leonis"}
*/
function parse_AnyName(data) {
	let mapName = {};
	data.infos.forEach((info) => {
		if (info.value) mapName[info.key] = info.value;
	});
	quicktest_add_jp_names(mapName);
	return mapName;
}
/*
	The iname is not always enough to have a unique identifier, a second parameter may be needed to create a unique key
	example: adventureAreaDropDeck, you have one object per iname per campaign, iname is not unique
	Return a Map, so use .get(key)
*/
function parse_AnyData(data, iname, iname2 = null) {
	let mapData = new Map();
	data.items.forEach((item) => {
		mapData.set(iname2 ? item[iname]+item[iname2] : item[iname], item);
	});
	return mapData;
}

