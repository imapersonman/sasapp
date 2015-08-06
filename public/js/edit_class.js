function addStudents(class_id) {
    var selected = $("#all-students input[type='checkbox']:checked");
    var ids = [];
    for (var s = 0; s < selected.length; s++) {
        var id = $(selected[s]).parentsUntil("tbody").last().attr("user_id");
        id = parseInt(id);
        ids.push(id);
    }
    var post_object = {
        class_id: class_id,
        students: JSON.stringify(ids)
    };
    $.post("/model/update/class/students", post_object, function(data, status) {
        location.reload();
    });
}

function removeStudents(class_id) {
    var selected = $("#class-students input[type='checkbox']:checked");
    var ids = [];
    for (var s = 0; s < selected.length; s++) {
        var id = $(selected[s]).parentsUntil("tbody").last().attr("user_id");
        id = parseInt(id);
        ids.push(id);
    }
    console.log("IDs: " + JSON.stringify(ids));
    var post_object = {
        class_id: class_id,
        students: JSON.stringify(ids)
    };
    $.post("/model/remove/class/students", post_object, function(data, status) {
        location.reload();
    });
}

function changeTeacher(class_id) {
    var teacher_id = $("#teacher-select option:selected").val();
    teacher_id = parseInt(teacher_id);
    if (teacher_id == "") {
        return;
    }
    var post_object = {
        class_id: class_id,
        teacher_id: teacher_id
    };
    $.post("/model/update/class/teacher", post_object, function(data, status) {
        location.reload();
    });
    console.log("New Teacher Id: " + teacher_id);
}
