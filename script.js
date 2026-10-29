
document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("myForm");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const selectedGender = form.querySelector('input[name="gender"]:checked');
        const uploadedFile = form.file.files[0];

        const formData = {
            formId: form.formId.value,
            text: form.text.value.trim(),
            email: form.email.value.trim(),
            password: form.password.value,
            number: form.number.value ? Number(form.number.value) : null,
            tel: form.tel.value.trim(),
            gender: selectedGender ? selectedGender.value : null,
            url: form.url.value.trim(),
            search: form.search.value.trim(),
            date: form.date.value,
            time: form.time.value,
            datetime: form.datetime.value,
            month: form.month.value,
            week: form.week.value,
            country: form.country.value,
            range: Number(form.range.value),
            color: form.color.value,
            file: uploadedFile ? {
                name: uploadedFile.name,
                size: uploadedFile.size,
                type: uploadedFile.type
            } : null,
            textarea: form.textarea.value.trim(),
            terms: form.terms.checked,
            submittedAt: new Date().toISOString()
        };

        // Show submitted data in console
        console.log("Submitted Data:", formData);

        // Show success popup
        alert("Form submitted successfully!");

        // Refresh the form fields
        form.reset();

    });

});
