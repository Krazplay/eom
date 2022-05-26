/*
	EoM-tables
	Contain the common code used by all the html datatable pages and the functions to
	produce the array which will feed the datatables
	get_datatables_xxx => Create an array of objects to be used as data for datatables
*/

weaponTypeName = ["-","Axe","Boomerang","Bow","Flail","Glove","???","Knife","Lance","Staff","Sword","Whip","Shield"]

AttachWeaponType = ["-","Axe","Boomerang","Bow","Flail","Glove","Javelin","Knife","Lance","Staff","Sword","Whip","Shield"]
AttackCategory = ["Physical", "Magic", "Blow", "Slash", "Thrust"]
AttackGroup = ["Normal", "Skill", "Special", "MagicSpecial"]
AttributeType = ["None", "Earth", "Wind", "Water", "Fire", "Dark", "Light", "Moon", "Wood", "All"]
CharacterType = ["None", "Playable", "MainCharacter", "Material", "EvolveMaterial", "LimitBreakMaterial"]
DamageDirectionType = ["None", "Normal", "Back", "Front"]
EnemyType = ["None", "Beast", "Plant", "Bug", "Reptile", "Aquatic", "Undead", "Demon", "Dragon", "MagicCreature", "DemiHuman"]
Gender = ["None", "Male", "Female", "Unknown"]
QuestChapterType = ["None", "Story", "Battle", "Exploration"]
QuestChapterCellType = ["None", "Story", "Battle", "Exploration", "Boss", "SubStory"]
//LotteryEquipmentType = ["Invalid", "Reward", "EquipmentSeriesGroup"]
LotteryEquipmentType = ["Invalid", "Reward", "EquipmentSeries"]
RewardType = ["None","Gem","Item","Character","MemoryGem","Equipment","LotteryEquipment","Weapon","Costume","Point","Stamp","Title","Talk"]
Series = ["None", "First", "Second", "Third", "Fourth", "Legend", "Children", "Friends", "Heros", "Circle", "Rise", "Wfs"]
StatusType = ["None", "Hp", "Mp", "PhysicalAttack", "PhysicalDefence", "MagicalAttack", "MagicalDefence", "Luck"]


/*
*   ====================            TABLE            ====================
*	====================         MasterAttack        ====================
*/

function get_datatable_MasterAttack() {
	let line_id = 1;
	result = [];
	// Loop on all attack objects
	for (let [iname, item] of masterAttack) {
		let line = {};
		// Loop on parameters of masterAttack
		for (const [stat, value] of Object.entries(item)) {
			line[stat] = value;
		}
		
		// Get CharacterID from AttackLabelID, not good
		//let masterCharacterID = mapAtkID_CharacID.get(iname);
		//line["MasterCharacterId"] = masterCharacterID;
		// try to get a name from somewhere
		//if (masterCharacterID != null) {
		//	let masterIdentityId = masterCharacter.get(masterCharacterID)["MasterIdentityId"];
		//	line["name"] = masterIdentity.get(masterIdentityId)["NameEn"];
		//}
		line["DamageRatio"] = line["DamageRatio"] / 100
		line["weaponName"] = AttachWeaponType[item["WeaponType"]];
		
		// Try to get skill name
		let shortMastAtckId = item["MasterAttackId"].toString().substring(1);
		let skill = l10NSkill.get(parseInt('3'+shortMastAtckId));
		if (skill != null) {
			line["skillName"] = skill["Text"];
		}
		
		line["line_id"] = line_id++;
		result.push(line);
	}
	
	return result;
}


function get_datatable_MasterEnemyStatus() {
	let line_id = 1;
	let result = [];
	// Loop on all masterEnemyStatus objects
	for (let [iname, item] of masterEnemyStatus) {
		let line = {};

		// MasterEnemy
		let enemyID = item["MasterEnemyStatusId"].toString().substring(2, 9); // 715001001001 => 5001001
		let currentMasterEnemy = masterEnemy.get(parseInt("70020"+enemyID))
		line["NameEn"] = currentMasterEnemy["NameEn"];
		line["Boss"] = currentMasterEnemy["Boss"];
		
		// MasterEnemyIdentity
		line["EnemyType"] = EnemyType[masterEnemyIdentity.get(currentMasterEnemy["MasterEnemyIdentityId"])["EnemyType"]];
		
		// MasterEnemyDamageRate
		let currentMasterEnemyDamageRate = masterEnemyDamageRate.get(currentMasterEnemy["MasterEnemyDamageRateId"]);
		for (const [stat, value] of Object.entries(currentMasterEnemyDamageRate)) {
			if (value != 10000) { line[stat] = value / 100 };
		}
		
		// MasterEnemyDurability
		let currentMasterEnemyDurability = masterEnemyDurability.get(currentMasterEnemy["MasterEnemyDurabilityId"]);
		for (const [stat, value] of Object.entries(currentMasterEnemyDurability)) {
			line[stat] = value;
		}
		
		// Loop on parameters (masterEnemyStatus)
		for (const [stat, value] of Object.entries(item)) {
			line[stat] = value;
		}
		
		line["line_id"] = line_id++;
		result.push(line);
	}
	
	return result;
}


function get_datatable_MasterQuestChapter() {
	let line_id = 1;
	let result = [];
	// Multiple missions can use the same EquipmentGroupId, generate a hash EquipmentGroupId => reward text
	let reward_text = get_hash_reward_to_text();
	// Loop on all objects
	for (let [iname, item] of masterQuestChapter) {
		let line = {};
		// Loop on parameters
		for (const [stat, value] of Object.entries(item)) {
			if (stat == "ChapterType") line[stat] = QuestChapterType[value];
			else if (stat == "ChapterCellType") line[stat] = QuestChapterCellType[value];
			else line[stat] = value;
		}
		
		line["chapterName"] = l10NQuestChapter.get(item["MasterQuestChapterId"])["ChapterName"];
		line["tips"] = l10NQuestChapter.get(item["MasterQuestChapterId"])["tips"];
		
		// Reward
		masterLotteryEquipment.get(item["ClearMasterRewardGroupId"]);
		
		let rewardGroupId = -1;
		// Elemental dungeons lv4 changed from lottery to direct reward...
		//console.log(item["ClearMasterRewardGroupId"].toString().substring(0,7));
		if (item["ClearMasterRewardGroupId"].toString().substring(0,7) == "4200811") {
			rewardGroupId = item["ClearMasterRewardGroupId"];
			console.log("work");
			console.log(reward_text[rewardGroupId]);
		}
		else {
			let shortId = item["ClearMasterRewardGroupId"].toString().substring(7);
			rewardGroupId = parseInt("5200010" + shortId)
		}
		line["Reward"] = reward_text[rewardGroupId];
		
		line["line_id"] = line_id++;
		result.push(line);
	}
	
	return result;
}

function get_hash_reward_to_text() {
	let result = {};
	// Loop on all lottery
	for (let [iname, item] of masterLotteryEquipment) {
		let hashkey = item["MasterLotteryEquipmentGroupId"]
		if (result[hashkey] == null) result[hashkey] = ""; // init if null
		let rate_text = item["Rate"] / 100
		// Equipment series
		if (item["MasterLotteryEquipmentSeriesGroupId"] != 0) {
			let shortSeriesId = item["MasterLotteryEquipmentSeriesGroupId"].toString().substring(6);
			equipText = l10NEquipmentSeries.get(parseInt('3002'+shortSeriesId));
			result[hashkey] += equipText["name"] + ` ${item["Rarity"]}* ` + " ("+rate_text+")<br/>";
		}
		// Others rewards
		if (item["MasterRewardId"] != 0) {
			let theReward = masterReward.get(item["MasterRewardId"]);
			let rewardName = "temp";
			if ( theReward["RewardType"] == 2 ) {
				if (theReward["RewardItemId"].toString().charAt(2) == "3") rewardName = l10NMemoryGemExpItem.get(theReward["RewardItemId"])["name"];
				else if (theReward["RewardItemId"].toString().charAt(2) == "4") rewardName = l10NManaBoardItem.get(theReward["RewardItemId"])["name"];
				else if (theReward["RewardItemId"].toString().charAt(2) == "5") rewardName = l10NEquipmentExpItem.get(theReward["RewardItemId"])["name"];
				else rewardName = theReward["RewardItemId"];
			}
			else if ( theReward["RewardType"] == 9 ) rewardName = l10NPoint.get(theReward["RewardItemId"])["name"];
			else rewardName = theReward["RewardItemId"];
			
			result[hashkey] +=  `${theReward["Quantity"]} ${rewardName} (${rate_text})<br/>`
		}
	}
	
	// Loop on all rewards
	for (let [iname, item] of masterReward) {
		let hashkey = item["MasterRewardGroupId"];
		if (result[hashkey] == null) result[hashkey] = ""; // init if null
		let theReward = item;
		let rewardName = "temp";
		if ( theReward["RewardType"] == 2 ) {
			if (theReward["RewardItemId"].toString().charAt(2) == "3") rewardName = l10NMemoryGemExpItem.get(theReward["RewardItemId"])["name"];
			else if (theReward["RewardItemId"].toString().charAt(2) == "4") rewardName = l10NManaBoardItem.get(theReward["RewardItemId"])["name"];
			else if (theReward["RewardItemId"].toString().charAt(2) == "5") rewardName = l10NEquipmentExpItem.get(theReward["RewardItemId"])["name"];
			else rewardName = theReward["RewardItemId"];
		}
		else if ( theReward["RewardType"] == 9 ) rewardName = l10NPoint.get(theReward["RewardItemId"])["name"];
		else rewardName = theReward["RewardItemId"];
		
		result[hashkey] +=  `${theReward["Quantity"]} ${rewardName} (100%)`
	}
	return result;
}

function get_datatable_MasterLotteryEquipment() {
	let line_id = 1;
	let result = [];
	// Loop on all objects
	for (let [iname, item] of masterLotteryEquipment) {
		let line = {};
		
		// Loop on parameters
		for (const [stat, value] of Object.entries(item)) {
			if (stat == "Rate") line[stat] = value / 100;
			else if (stat == "LotteryEquipmentType") line[stat] = LotteryEquipmentType[value];
			else if (value == false) line[stat] = "";
			else line[stat] = value;
		}
		
		if (item["MasterLotteryEquipmentSeriesGroupId"] != 0) {
			let shortSeriesId = item["MasterLotteryEquipmentSeriesGroupId"].toString().substring(6);
			equipText = l10NEquipmentSeries.get(parseInt('3002'+shortSeriesId));
			line["name"] = equipText["name"];
			line["description"] = equipText["description"];
		}
		
		if (item["MasterRewardId"] != 0) {
			let theReward = masterReward.get(item["MasterRewardId"]);
			line["Quantity"] = theReward["Quantity"];
			line["RewardType"] = RewardType[theReward["RewardType"]];
			if ( theReward["RewardType"] == 2 ) {
				if (theReward["RewardItemId"].toString().charAt(2) == "3") line["RewardItemId"] = l10NMemoryGemExpItem.get(theReward["RewardItemId"])["name"];
				else if (theReward["RewardItemId"].toString().charAt(2) == "4") line["RewardItemId"] = l10NManaBoardItem.get(theReward["RewardItemId"])["name"];
				else if (theReward["RewardItemId"].toString().charAt(2) == "5") line["RewardItemId"] = l10NEquipmentExpItem.get(theReward["RewardItemId"])["name"];
				else line["RewardItemId"] = theReward["RewardItemId"];
			}
			else if ( theReward["RewardType"] == 9 ) line["RewardItemId"] = l10NPoint.get(theReward["RewardItemId"])["name"];
			else line["RewardItemId"] = theReward["RewardItemId"];
		}
		line["line_id"] = line_id++;
		result.push(line);
	}
	return result;
}


function get_datatable_MasterLotteryRate() {
	let line_id = 1;
	let result = [];
	// Loop on all objects
	for (let [iname, item] of masterLotteryRate) {
		let line = {};
		
		// Loop on parameters
		for (const [stat, value] of Object.entries(item)) {
			if (stat == "Rate") line[stat] = value / 100;
			else if (stat == "LotteryEquipmentType") line[stat] = LotteryEquipmentType[value];
			else if (value == false) line[stat] = "";
			else line[stat] = value;
		}
		
		
		line["line_id"] = line_id++;
		result.push(line);
	}
	return result;
}

function get_datatable_MasterCharacter() {
	let line_id = 1;
	let result = [];
	// Loop on all objects
	for (let [iname, item] of masterCharacter) {
		let line = {};
		
		// Loop on parameters
		for (const [stat, value] of Object.entries(item)) {
			if (value == false) line[stat] = "";
			else line[stat] = value;
		}
		
		line["attributeName"] = AttributeType[item["Attribute"]];
		line["weaponName"] = AttachWeaponType[item["WeaponType"]];
		line["CharacterType"] = CharacterType[item["CharacterType"]];
		line["RecoveryStatusType"] = StatusType[item["RecoveryStatusType"]];
		
		// Grab string after last slash of AssetPath
		line["AssetName"] = /[^/]*$/.exec(item["AssetPath"])[0];
		
		let identity = masterIdentity.get(item["MasterIdentityId"]);
		line["NameEn"] = identity["NameEn"];
		line["Gender"] = Gender[identity["Gender"]];
		line["Series"] = Series[identity["Series"]];
		
		let charStatus = masterCharacterStatus.get(item["MasterCharacterStatusId"]);
		for (const [stat, value] of Object.entries(charStatus)) {
			if (value == false) line[stat] = "";
			else line[stat] = value;
		}
		
		line["line_id"] = line_id++;
		result.push(line);
	}
	return result;
}

/*
*   ====================   Common functions used   ====================
*	====================  in all datatables pages  ====================
*/

// Array will be used by datatable columnDefs to set their visibility to false
function get_columns_to_hide() {
	// Get url parameters
	const queryString = window.location.search;
	urlParams = new URLSearchParams(queryString);
	const hidecol = urlParams.get('hidecol');
	// If hidecol param in url, use that
	if (hidecol != null) {
		console.log("Columns visibility loaded from URL");
		return hidecol.split(',').map(x=>+x); // convert to array of integers
	}
	// Nothing in url, check localstorage
	// Quickfix, if localStorage = "", it will return 0 and hide first column, prevent that
	else if ( localStorage.getItem(getPageName()+"_columns") == "" ) {
		return "";
	}
	else if ( localStorage.getItem(getPageName()+"_columns") != null ) {
		console.log("Columns visibility loaded from localstorage");
		return localStorage.getItem(getPageName()+"_columns").split(',').map(x=>+x);
	}
}

// Return what language to use
function get_language() {
	let lang = localStorage.getItem("language");
	if ( lang == null ) { lang = "en" }
	console.log("Language="+lang);
	return lang;
}

// Return the game version data to use
function get_version() {
	let version = localStorage.getItem("version");
	if ( version == null ) { version = "gl" }
	console.log("Game version="+version);
	return version;
}

// Used to prefix some local storage variable names with the page name
function getPageName() {
	var url = window.location.pathname;
    var index = url.lastIndexOf("/") + 1;
    var filenameWithExtension = url.substr(index);
    var filename = filenameWithExtension.split(".")[0];
    return filename;
}

// For all checkbox inputs, check the local storage for a saved state
function load_checkboxes_state() {
	$("input[type=checkbox]").each(function() {
		var id = $(this).attr('id');
		$(this).prop('checked', localStorage.getItem(id) == "true"); // getItem return a string
	});
	
	$("input[type=text].memo").each(function() {
		var id = $(this).attr('id');
		$(this).val( localStorage.getItem(id) );
	});
}

// Add an event on all checboxes, saving any state change in local storage
function add_event_save_checkbox() {
	$("input[type=checkbox]").change(function() {
		var id = $(this).attr('id');
		localStorage.setItem(id, $(this).prop('checked'));
	});
	
	$("input[type=text].memo").on( 'keyup change', function() {
		var id = $(this).attr('id');
		localStorage.setItem(id, $(this).val());
	});
}

// Proced by onkeyup event or memo size input
function memoSizeChange(e) {
	let val = parseInt(document.getElementById(e.target.id).value);
	if (!isNaN(val)) {
		localStorage.setItem(e.target.id, val);
		$( ".thmemo" ).css({"min-width": val+"px"});
		$( ".thmemo" ).css({"max-width": val+"px"});
	}
}

// Delay to avoid filtering while the user is still typing
function delay(fn, ms) {
	let timer = 0
	return function(...args) {
		clearTimeout(timer);
		timer = setTimeout(fn.bind(this, ...args), ms || 0);
	}
}

// If there are filters in the url as param, write them down in the input filter fields
// urlParams defined in get_columns_to_hide()
function prefill_filters_via_url() {
	// Filter prefilled via url
	let nb_columns = table.columns().count();
	let need_redraw = false;
	for (let i=0; i < nb_columns; i++) {
		let search_col = urlParams.get('filter'+i);
		if (search_col != null) {
			search_col = decodeURIComponent(search_col);
			if( $('input[name=regex_search]').is(':checked') ) {
				table.column(i).search( search_col, true, false );  // value, regex?, smart search?
			}
			else {
				table.column(i).search( search_col );
			}
			need_redraw = true;
			// write the url filter in the input field
			$( "table thead tr:eq(1) th[data-column-index='"+i+"'] input" ).val( search_col );
		}
	}
	if (need_redraw) table.draw(); // refresh only if an url filter was found
}

function attach_functions_on_events() {
	// Event fired when a column visibility change
	table.on( 'column-visibility.dt', function ( e, settings, column, state ) {
		save_col_vis_to_localstorage();
	});
	
	// Event fired when the user start moving a row
	nb_lines = table.rows().count();
	table.on( 'pre-row-reorder.dt', function ( e, node, index ) {
		for (let i=0; i < nb_lines; i++) {
			let r = table.row( ':eq('+i+')' )
			r.data().line_id = i+1;
			r.invalidate();
		}
	} );
	
	// Event fired when the user finish moving a row
	table.on( 'row-reordered.dt', function ( e, diff, edit ) {
		table.order( [ 0, 'asc' ] ).draw();
		load_checkboxes_state(); // needed to keep checkboxes state after the reorder
	} );
	
	// Event fired when the user finish moving a column
	table.on( 'column-reorder', function ( e, settings, details ) {
		load_checkboxes_state(); // needed to keep checkboxes state after the reorder
	} );
}

function set_default_val_dropdown() {
	$("#language").val(language);
	$("#version").val(version);
}

function languageChange(value) {
	console.log("Switch to "+value);
	localStorage.setItem("language", value);
	location.reload();
}

function versionChange(value) {
	console.log("Switch to "+value);
	localStorage.setItem("version", value);
	location.reload();
}

// Check columns visibility and input and write the equivalent url in #table_url
function refresh_url_span() {
	var table = $('#myTable').DataTable();
	let url_param = "";
	if (urlParams.get('file')) url_param += "?file="+urlParams.get('file');
	
	// Loop as much as there are columns
	let nb_columns = table.columns().count();
	for (let i=1; i < nb_columns; i++) {
		// Try to get the input val
		let input_val = $( "table thead tr:eq(1) th[data-column-index='"+i+"'] input" ).val();
		if (input_val != "" && input_val != null) {
			url_param += (url_param == "") ? "?" : "&";
			url_param += "filter"+i+"="+encodeURIComponent(input_val);
		}
	}
	// Write the url in the document now
	var url_table = window.location.protocol + '//' + window.location.hostname + window.location.pathname;
	$('#table_url').html(url_table+url_param);
};

// Save current columns visibility into localstorage
function save_col_vis_to_localstorage() {
	var resultset = table.columns().visible();
	var list_col = "";
	for (var i = 0; i < resultset.length; i++) {
		if (resultset[i] == false) {
			if (list_col != "") list_col += ",";
			list_col += i.toString()
		};
	}
	localStorage.setItem(getPageName()+"_columns", list_col);
}