function getTeachers(student_id) {
    var post_object = {
        student_id: student_id
    };
    $.post("/model/find/student_classes", post_object, function(data, status) {
        renderTeachers(JSON.parse(data));
    });
}

function getRankings(student_id) {
    var post_object = {
        student_id: student_id
    };
    $.post("/model/find/rankings", post_object, function(data, status) {
        renderRankings(JSON.parse(data));
    });
}

function renderTeachers(teachers) {
    var options = "<option></option>";
    for (o = 0; o < teachers.length; o++) {
        var value = o + 1;
        options += "<option value=\"" + value + "\">" + value + "</option>";
    }
    console.log("Length: " + teachers.length)
    for (var t = 0; t < teachers.length; t++) {
        $("tbody#teacher-list").append(""
            + "<tr st_id=" + teachers[t].st_id + ">"
            + "<td>"
            + "<select class=\"rank-list\">"
            + options
            + "</select>"
            + "</td>"
            + "<td>" + teachers[t].name + "</td>"
            + "<td><a href=\"mailto:" + teachers[t].email + "\">" + teachers[t].email + "</td>"
            + "<td>" + teachers[t].room_num + "</td>"
            + "</tr>"
        );
    }
}

function renderRankings(rankings) {
    console.log(rankings);
    for (var r = 0; r < rankings.length; r++) {
        $("ul#rank-list").append(""
            + "<li>" + rankings[r].name + " in room " + rankings[r].room_num + " as choice #" + rankings[r].rank + "</li>"
        );
    }
}

function sendRanks() {
    $('#loading-indicator').show();
    var class_ranks = [];
    $(".rank-list").each(function() {
        var st_id = $(this).parentsUntil("tbody").last().attr("st_id");
        var rank = $(this).find(":selected").val();
        class_ranks.push({
            st_id: st_id,
            rank: (rank != "") ? rank : 0
        });
    });
    var post_object = {
        ranks: JSON.stringify(class_ranks)
    };
    console.log(class_ranks);
    $.post("/model/student/request", post_object, function(data, status) {
        location.reload(true);
    });
}