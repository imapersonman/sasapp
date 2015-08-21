function getStudents(teacher_id) {
    var post_object = {
        teacher_id: teacher_id
    };
    $.post("/model/find/teacher_students", post_object, function(data, status) {
        renderStudents(JSON.parse(data));
    });
}

function renderStudents(students) {
    console.log("Length: " + students.length)
    for (var s = 0; s < students.length; s++) {
        $("tbody#student-list").append(""
            + "<tr s_id=" + students[s].id + ">"
            + "<td><input type=\"checkbox\" value=\"\"</td>"
            + "<td>" + students[s].name + "</td>"
            + "<td><a href=\"mailto:" + students[s].email + "\">" + students[s].email + "</td>"
            + "</tr>"
        );
    }
}

function getRankings(teacher_id) {
    console.log("User ID: " + teacher_id);
    var post_object = {
        teacher_id: teacher_id
    };
    $.post("/model/find/teacher/rankings", post_object, function(data, status) {
        renderRankings(JSON.parse(data));
    });
}

function renderRankings(rankings) {
    console.log(rankings);
    for (var r = 0; r < rankings.length; r++) {
        $("ul#rank-list").append(""
            + "<li>" + rankings[r].name + "</li>"
        );
    }
}

function sendRanks(user_id) {
    var students = [];
    $("#student-list input[type='checkbox']:checked").each(function() {
        var s_id = $(this).parentsUntil("tbody").last().attr("s_id");
        students.push(s_id);
    });
    var post_object = {
        teacher_id: user_id,
        students: JSON.stringify(students)
    };
    console.log(students);
    $.post("/model/teacher/request", post_object, function(data, status) {
        location.reload(true);
    });
}
