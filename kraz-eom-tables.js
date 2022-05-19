/*
	EoM-tables
	Contain the common code used by all the html datatable pages and the functions to
	produce the array which will feed the datatables
	get_datatables_xxx => Create an array of objects to be used as data for datatables
*/

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
		
		// Get CharacterID from AttackLabelID
		let masterCharacterID = mapAtkID_CharacID.get(iname);
		line["MasterCharacterId"] = masterCharacterID;
		// try to get a name from somewhere
		if (masterCharacterID != null) {
			let masterIdentityId = masterCharacter.get(masterCharacterID)["MasterIdentityId"];
			line["name"] = masterIdentity.get(masterIdentityId)["NameEn"];
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
		//console.log($(this).val());
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