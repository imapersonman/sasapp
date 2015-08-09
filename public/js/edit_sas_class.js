function changeStudentCap(sas_class_id) {
    var student_cap = $("input#student_cap").val();
    var post_object = {
        sas_class_id: sas_class_id,
        student_cap: student_cap
    };
    $.post("/model/update/sas_class/student_cap", post_object, function(data, status) {
        location.reload();
    });
}
