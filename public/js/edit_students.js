$(document).ready(function() {

    var old_value = "";
    var new_value = "";
    $("tbody.editable-list tr td input").blur(function() {
        new_value = $(this).val().trim();
        if(old_value.trim() != new_value.trim()) {

            var editedObject = {};
            if ($(this).parentsUntil("tbody").last().attr("user_id") != "null") {
                // Student Name
                editedObject.user_id = $(this).parentsUntil("tbody").last().attr("user_id");
                if ($(this).parent().index() == 0) {
                    editedObject.name = new_value;
                } else
                // Student Email
                if ($(this).parent().index() == 1) {
                    editedObject.email = new_value;
                }
            }
            edited.push(editedObject);

        }
    }).focus(function() {
        old_value = $(this).val().trim();
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
    var studentList = [];

    var rows = $(".editable-list").children();
    for(var a = 0; a < added.length; a++) {
        var s = added[a];
        var student = rows[s];

        var name = $($($(student).children()[0]).children()[0]).val().trim();
        var email = $($($(student).children()[1]).children()[0]).val().trim();

        console.log("Name: " + name);
        console.log("Email: " + email);

        studentList.push({
            name: name,
            email: email,
            type: "student"
        });
    }

    console.log("Edits: " + JSON.stringify(edited));
    $.post("/model/update/student",
    {
        editedStudents: JSON.stringify(packageEditedStudents()),
        addedStudents: JSON.stringify(studentList),
        removedStudents: JSON.stringify(removed)
    },
    function(data, status) {
        document.location = "/user/students";
    });
}

function packageEditedStudents() {
    var students = {};
    for(var e = 0; e < edited.length; e++) {
        var user_id = edited[e].user_id;
        if (students[user_id] == null) {
            students[user_id] = {
                name: null,
                email: null,
                school_id: null
            };
        }
        var property_key = Object.keys(edited[e])[1];
        var property_value = edited[e][property_key];
        students[user_id][property_key] = property_value;
    }
    return students;
}

function addRow() {
    rowSize++;
    console.log("Added row at index: " + rowSize);
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
    var row = parseInt($(target).parentsUntil("tbody").last().attr("row_index"));
    var user_id = $(target).parentsUntil("tbody").last().attr("user_id");
    var rowIndex = added.indexOf(row);
    if (user_id == "null") {
        console.log("row_index: " + rowIndex);
        added.splice(rowIndex, 1);
    }else {
        removed.push(parseInt(user_id));
    }
    console.log(removed);
    $(target).parentsUntil("tbody").last().remove();
}

var rowSize = 0;
function setInitialRowSize(initialSize) {
    rowSize = initialSize;
}
