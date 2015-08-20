var edited = [];
var added = [];
var removed = [];

$(document).ready(function() {
    var old_value = "";
    var new_value = "";
    $("tbody.editable-list tr td input").blur(function() {
        new_value = $(this).val().trim();
        if (old_value.trim() != new_value.trim()) {
            var editedObject = {};
            var field = $(this).parent().attr("field");
            console.log("Field: " + field);
            var id;
            if ((id = $(this).parentsUntil("tbody").last().attr("id")) !== "null") {
                editedObject.id = id;
                editedObject[field] = new_value;
            }
            console.log("Edited Object: " + editedObject);
            edited.push(editedObject);
        }
    });

    $("tbody.editable-list tr td select").change(function() {
        var editedObject = {};
        editedObject.id = $(this).parentsUntil("tbody").last().attr("id");
        editedObject[field] = $(this).val();
        edited.push(editedObject);
    });
});

function sendChanges(field, redirect_url) {
    var addedObjects = [];
    var rows = $("tbody.editable-list").children();
    for (var a = 0; a < added.length; a++) {
        var r = added[a];
        var row = rows[r];

        var object = {};
        $(row).children().each(function() {
            var tag_name = $(this).children().first().prop("tagName");
            if (tag_name == "BUTTON") return;
            var field = $(this).attr("field");
            var field_val = "";
            if (tag_name == "INPUT") {
                field_val = $(this).children().first().val().trim();
            } else {
                field_val = $(this).text().trim();
            }
            object[field] = field_val;
        });

        addedObjects.push(object);
    }

    edited = packageEdits(edited);
    console.log("Added: " + JSON.stringify(addedObjects));
    console.log("Edited: " + JSON.stringify(edited));
    console.log("Removed: " + JSON.stringify(removed));
    $.post("/model/edit/" + field, {
        edited: JSON.stringify(edited),
        added: JSON.stringify(addedObjects),
        removed: JSON.stringify(removed)
    }, function(data, status) {
        document.location = redirect_url;
    });
}

function packageEdits(p_edited) {
    var return_edits = {};
    for (var e = 0; e < p_edited.length; e++) {
        var id = p_edited[e].id;
        if (return_edits[id] == null) {
            return_edits[id] = {};
        }
        var property_key = Object.keys(p_edited[e])[1];
        var property_value = p_edited[e][property_key];
        return_edits[id][property_key] = property_value;
    }
    return return_edits;
}

function addRow() {
    rowSize++;
    added.push(rowSize);
    
    var row_template = "";
    $("#row-template").children().each(function() {
        var field = $(this).attr("field");
        var value = $(this).val();
        row_template += "<td field=" + field + ">" + $(this).html() + "</td>";
    });
    $("tbody.editable-list").append(""
            + "<tr id=null row_index = " + rowSize + ">"
            + row_template
            + "<td>"
            + "<button onclick=\"removeRow(this)\" style=\"float: right\" type=\"button\" class=\"btn btn-default btn-sm\">"
            + "<span class=\"glyphicon glyphicon-minus\"></span> Remove"
            + "</button>"
            + "</td>"
            + "</tr>");
}

function removeRow(target) {
    var row = $(target).parentsUntil("tbody").last();
    var row_index = parseInt(row.attr("row_index"));
    var id = row.attr("id");
    console.log("Id: " + id);
    var row_arr_index = added.indexOf(row_index);
    if (id == "null") {
        console.log("row_index: " + row_arr_index);
        added.splice(row_arr_index, 1);
    } else {
        console.log(removed);
        removed.push(id);
    }
    row.remove();
}

var rowSize = 0;
function setInitialRowSize(initialSize) {
    rowSize = initialSize;
}
