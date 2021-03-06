$(document).ready(function() {

    $(document).ajaxComplete(function(event, request, settings) {
        $('#loading-indicator').hide();
    });

    var old_value = "";
    var new_value = "";
    $("tbody.editable-list tr td input").blur(function() {
        new_value = $(this).val().trim();
        if(old_value.trim() != new_value.trim()) {

            var editedObject = {};
            if ($(this).parentsUntil("tbody").last().attr("class_id") != "null") {
                editedObject.class_id = $(this).parentsUntil("tbody").last().attr("class_id");
                // Class Name
                if ($(this).parent().index() == 1) {
                    editedObject.name = new_value;
                } else
                // Room Number
                if ($(this).parent().index() == 2) {
                    editedObject.room_num = new_value;
                } else
                // Class Period
                if ($(this).parent().index() == 3) {
                    editedObject.period = new_value;
                }
            }
            console.log("Edited Object: " + editedObject);
            edited.push(editedObject);

        }
    }).focus(function() {
        old_value = $(this).val().trim();
    });
});

function adminFinishedSASEdit() {
    var value = $("input#sas").val();
    $("#room_display_" + curr_row).text(function(i, oldWord) {
        return value;
    });
}

var added = new Array();
var removed = new Array();
var edited = new Array();

function sendClassChanges() {
    $('#loading-indicator').show();
    var classList = [];

    var rows = $(".editable-list").children();
    for(var a = 0; a < added.length; a++) {
        var c = added[a];
        var _class = rows[c];

        var name = $($($(_class).children()[1]).children()[0]).val().trim();
        var room_num = $($($(_class).children()[2]).children()[0]).val().trim();
        var period = $($($(_class).children()[3]).children()[0]).val().trim();

        classList.push({
            name: name,
            room_num: room_num,
            period: period
        });
    }

    edited = packageEditedClasses();
    $.post("/model/update/class",
    {
        editedClasses: JSON.stringify(edited),
        addedClasses: JSON.stringify(classList),
        removedClasses: JSON.stringify(removed)
    },
    function(data, status) {
        document.location = "/user/classes";
    });
}

function packageEditedClasses() {
    var classes = {};
    for(var e = 0; e < edited.length; e++) {
        var class_id = edited[e].class_id;
        if (classes[class_id] == null) {
            classes[class_id] = {
                name: null,
                period: null
            };
        }
        var property_key = Object.keys(edited[e])[1];
        var property_value = edited[e][property_key];
        classes[class_id][property_key] = property_value;
    }
    return classes;
}

function addRow() {
    rowSize++;
    console.log("Added row at index: " + rowSize);
    added.push(rowSize);
    $(".editable-list").append(""
        + "<tr class_id=null row_index=" + rowSize + ">"
        + "<td>Teacher</td>"
        + "<td><input class=\"form-control\" type=\"text\" value=\"Name\"></td>"
        + "<td><input class=\"form-control\" type=\"text\" value=\"Room Number\"></td>"
        + "<td><input class=\"form-control\" type=\"text\" value=\"Period\"></td>"
        + "<td>"
        + "<button onclick=\"removeRow(this)\" style=\"float: right\" type=\"button\" class=\"btn btn-default btn-sm\">"
        + "<span class=\"glyphicon glyphicon-minus\"></span> Remove"
        + "</button>"
        + "</td>"
        + "</tr>"
    );
}

function removeRow(target) {
    var row = parseInt($(target).parentsUntil("tbody").last().attr("row_index"));
    var class_id = $(target).parentsUntil("tbody").last().attr("class_id");
    var rowIndex = added.indexOf(row);
    if (class_id == "null") {
        console.log("row_index: " + rowIndex);
        added.splice(rowIndex, 1);
    }else {
        removed.push(parseInt(class_id));
    }
    console.log(removed);
    $(target).parentsUntil("tbody").last().remove();
}

var rowSize = 0;
function setInitialRowSize(initialSize) {
    rowSize = initialSize;
}
