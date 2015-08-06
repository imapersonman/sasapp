function getStudents(teacher_id) {
    var post_object = {
        teacher_id
    };
    $.post("/model/find/teacher_students", post_object, function(data, status) {
        renderStudents(JSON.parse(data));
    });
}

function renderStudents(students) {
    console.log("Length: " + students.length)
    for (var s = 0; s < students.length; s++) {
        $("tbody#student-list").append(""
            + "<tr st_id=" + students[s].st_id + ">"
            + "<td><input type=\"checkbox\" value=\"\"</td>"
            + "<td>" + students[s].name + "</td>"
            + "<td><a href=\"mailto:" + students[s].email + "\">" + students[s].email + "</td>"
            + "</tr>"
        );
    }
}

function sendRanks() {
    var students = [];
    $("#student-list input[type='checkbox']:checked").each(function() {
        var st_id = $(this).parentsUntil("tbody").last().attr("st_id");
        students.push({
            st_id: st_id
        });
    });
    var post_object = {
        students: JSON.stringify(students)
    };
    console.log(students);
    $.post("/model/teacher/request", post_object, function(data, status) {
        location.reload(true);
    });
}
