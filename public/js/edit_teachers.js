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
            if ($(this).parentsUntil("tbody").last().attr("user_id") != "null") {
                // Teacher Name
                editedObject.user_id = $(this).parentsUntil("tbody").last().attr("user_id");
                if ($(this).parent().index() == 0) {
                    editedObject.name = new_value;
                } else
                // Teacher Email
                if ($(this).parent().index() == 1) {
                    editedObject.email = new_value;
                }
            }
            edited.push(editedObject);
        }
    }).focus(function() {
        old_value = $(this).val().trim();
    });

    $("tbody.editable-list tr td select#sas-select").change(function() {
        var editedObject = {};
        editedObject.user_id = $(this).parentsUntil("tbody").last().attr("user_id");
        editedObject.sas_class_id = $(this).val();
        edited.push(editedObject);
    });

    $("tbody.editable-list tr td select#school-select").change(function() {
        var editedObject = {};
        editedObject.user_id = $(this).parentsUntil("tbody").last().attr("user_id");
        editedObject.school_id = $(this).val();
        edited.push(editedObject);
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

function sendStudentChanges() {
    $('#loading-indicator').show();
    var teacherList = [];

    var rows = $(".editable-list").children();
    for(var a = 0; a < added.length; a++) {
        var s = added[a];
        var teacher = rows[s];

        var name = $($($(teacher).children()[0]).children()[0]).val().trim();
        var email = $($($(teacher).children()[1]).children()[0]).val().trim();

        teacherList.push({
            name: name,
            email: email,
            type: "teacher"
        });
    }

    edited = packageEditedTeachers();
    $.post("/model/update/teacher",
    {
        editedTeachers: JSON.stringify(edited),
        addedTeachers: JSON.stringify(teacherList),
        removedTeachers: JSON.stringify(removed)
    },
    function(data, status) {
        document.location = "/user/teachers";
    });
}

function packageEditedTeachers() {
    var teachers = {};
    for(var e = 0; e < edited.length; e++) {
        var user_id = edited[e].user_id;
        if (teachers[user_id] == null) {
            teachers[user_id] = {
                name: null,
                email: null,
                sas_class_id: null,
                school_id: null
            };
        }
        var property_key = Object.keys(edited[e])[1];
        var property_value = edited[e][property_key];
        teachers[user_id][property_key] = property_value;
    }
    return teachers;
}

function addRow() {
    rowSize++;
    added.push(rowSize);
    $(".editable-list").append(""
        + "<tr user_id=null row_index=" + rowSize + ">"
        + "<td><input class=\"form-control\" type=\"text\" value=\"Name\"></td>"
        + "<td><input class=\"form-control\" type=\"text\" value=\"Email\"></td>"
        + "<td>Room Number</td>"
        + "<td>School</td>"
        + "<td>"
        + "<button onclick=\"removeRow(this)\" style=\"float: right\" type=\"button\" class=\"btn btn-default btn-sm\">"
        + "<span class=\"glyphicon glyphicon-minus\"></span> Remove"
        + "</button>"
        + "</td>"
        + "</tr>"
    );
}

function removeRow(target) {
    // Because firefox feels like being silly.
    var row = parseInt($(target).parentsUntil("tbody").last().attr("row_index"));
    var user_id = $(target).parentsUntil("tbody").last().attr("user_id");
    var rowIndex = added.indexOf(row);
    if (user_id == "null") {
        added.splice(rowIndex, 1);
    }else {
        removed.push(parseInt(user_id));
    }
    $(target).parentsUntil("tbody").last().remove();
}

var rowSize = 0;
function setInitialRowSize(initialSize) {
    rowSize = initialSize;
}
