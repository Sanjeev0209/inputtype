/**
 * LYF&GO Multi-Section Form Script
 * - Validates mobile number (10 digits)
 * - "No Experience" checkbox stores all experience values as null
 * - In-place updates to the same object upon corrections
 * - No console.table (pure Object format in console)
 * - Non-scroll compact format & popup toast notifications
 * - Steps 1, 2, and 3 all turn green on submission
 */

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("myForm");
    const steps = [document.getElementById("step1"), document.getElementById("step2"), document.getElementById("step3")];
    const stepItems = document.querySelectorAll(".wizard-stepper .step-item");
    const lineFills = [document.getElementById("lineFill1"), document.getElementById("lineFill2")];
    const toast = document.getElementById("toast");

    // Central single object updated in-place
    const formData = {
        formId: form.formId.value,
        personalDetails: {},
        qualificationDetails: {},
        experienceDetails: {}
    };

    let currentStep = 1;
    let toastTimer;
    let uploadedFile = null;

    // Mobile Number Validator (10 digits, optional +91 / country code)
    function isValidMobile(phoneStr) {
        if (!phoneStr) return false;
        const cleaned = phoneStr.replace(/[\s\-\(\)\.]/g, "");
        const indianPattern = /^(\+91|91|0)?[6-9]\d{9}$/;
        const intlPattern = /^\+?[1-9]\d{9,14}$/;
        return indianPattern.test(cleaned) || intlPattern.test(cleaned);
    }

    // Phone input live hint & validation
    const phoneInput = document.getElementById("phone");
    const phoneHint = document.getElementById("phoneHint");

    function updatePhoneHint() {
        const val = phoneInput.value.trim();
        if (!val) {
            phoneHint.textContent = "Enter a valid 10-digit mobile number";
            phoneHint.className = "phone-hint";
            return false;
        }
        const valid = isValidMobile(val);
        if (!valid) {
            phoneHint.textContent = "Invalid mobile number (must be 10 digits)";
            phoneHint.className = "phone-hint invalid";
        } else {
            phoneHint.textContent = "Valid mobile number ✓";
            phoneHint.className = "phone-hint valid";
        }
        return valid;
    }

    if (phoneInput) {
        phoneInput.addEventListener("input", () => {
            updatePhoneHint();
            validateCurrentStep();
        });
    }

    // "No Experience" Checkbox Handling
    const noExpCheckbox = document.getElementById("noExperience");
    const expWrapper = document.getElementById("experienceFieldsWrapper");

    if (noExpCheckbox) {
        noExpCheckbox.addEventListener("change", function () {
            if (this.checked) {
                expWrapper.classList.add("disabled-experience");
                showPopup("Fresher Selected", "Experience fields skipped. Values will store as null.");
            } else {
                expWrapper.classList.remove("disabled-experience");
            }
            validateCurrentStep();
        });
    }

    // Popup Toast Message (no browser alert dialog)
    function showPopup(title, msg, isError = false) {
        document.getElementById("toastTitle").textContent = title;
        document.getElementById("toastMsg").textContent = msg;
        toast.className = "toast show" + (isError ? " toast-error" : "");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
    }

    // Password Show/Hide Toggle
    const toggleBtn = document.getElementById("togglePasswordBtn");
    const pwdInput = document.getElementById("password");
    if (toggleBtn && pwdInput) {
        toggleBtn.addEventListener("click", () => {
            const isPwd = pwdInput.type === "password";
            pwdInput.type = isPwd ? "text" : "password";
            toggleBtn.querySelector("i").className = isPwd ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
        });
    }

    // Password Condition Validator: checks 1 Uppercase, 1 Number, 1 Special Character (logic only)
    function isValidPassword(pwd) {
        if (!pwd) return false;
        const hasUpper = /[A-Z]/.test(pwd);
        const hasNumber = /[0-9]/.test(pwd);
        const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
        return hasUpper && hasNumber && hasSpecial;
    }

    if (pwdInput) {
        pwdInput.addEventListener("input", validateCurrentStep);
    }

    // Range Slider Live Value
    const expSlider = document.getElementById("yearsOfExperience");
    const expBadge = document.getElementById("expVal");
    if (expSlider && expBadge) {
        expSlider.addEventListener("input", (e) => {
            expBadge.textContent = `${e.target.value} ${e.target.value == 1 ? "Year" : "Years"}`;
        });
    }

    // Resume Dropzone Handling
    const resumeInput = document.getElementById("resumeFile");
    const dropzoneDefault = document.getElementById("dropzoneDefault");
    const dropzoneSelected = document.getElementById("dropzoneSelected");
    const fileNameTxt = document.getElementById("fileNameTxt");
    const clearFileBtn = document.getElementById("clearFileBtn");

    function setResume(file) {
        uploadedFile = file;
        if (file) {
            fileNameTxt.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
            dropzoneDefault.style.display = "none";
            dropzoneSelected.style.display = "flex";
        } else {
            resumeInput.value = "";
            dropzoneDefault.style.display = "flex";
            dropzoneSelected.style.display = "none";
        }
        validateCurrentStep();
    }

    if (resumeInput) resumeInput.addEventListener("change", (e) => setResume(e.target.files[0]));
    if (clearFileBtn) clearFileBtn.addEventListener("click", (e) => { e.stopPropagation(); setResume(null); });

    // Validate a section
    function validateSection(stepNum) {
        const stepEl = steps[stepNum - 1];

        // Specific Section 1 validation (includes mobile number & password condition check)
        if (stepNum === 1) {
            const inputs = stepEl.querySelectorAll("input[required], select[required], textarea[required]");
            for (let input of inputs) {
                if (input.type === "checkbox") {
                    if (!input.checked) return false;
                } else if (!input.value.trim() || !input.checkValidity()) {
                    return false;
                }
            }
            if (!isValidMobile(form.phone.value.trim())) {
                return false;
            }
            if (!isValidPassword(form.password.value)) {
                return false;
            }
            return true;
        }

        // Section 2 validation
        if (stepNum === 2) {
            const inputs = stepEl.querySelectorAll("input[required], select[required], textarea[required]");
            for (let input of inputs) {
                if (!input.value.trim() || !input.checkValidity()) {
                    return false;
                }
            }
            return true;
        }

        // Section 3 validation: if "No Experience" checked, only terms is required!
        if (stepNum === 3) {
            const termsChecked = form.terms && form.terms.checked;
            if (noExpCheckbox && noExpCheckbox.checked) {
                return termsChecked;
            }
            // If experienced, all experience fields and terms required
            const expInputs = expWrapper.querySelectorAll("input[required], select[required], textarea[required]");
            for (let input of expInputs) {
                if (input.type === "file") {
                    if (!uploadedFile) return false;
                } else if (!input.value.trim() || !input.checkValidity()) {
                    return false;
                }
            }
            return termsChecked;
        }

        return true;
    }

    // Enable/disable Next or Submit button based on current step completeness
    function validateCurrentStep() {
        const isValid = validateSection(currentStep);
        const btnId = currentStep === 1 ? "nextStep1" : (currentStep === 2 ? "nextStep2" : "submitAllBtn");
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.disabled = !isValid;
            btn.classList.toggle("btn-disabled", !isValid);
        }
        return isValid;
    }

    // Update Section 1 data in the same object
    function saveSection1() {
        Object.assign(formData.personalDetails, {
            fullName: form.fullName.value.trim(),
            email: form.email.value.trim(),
            password: form.password.value,
            age: Number(form.age.value),
            phone: form.phone.value.trim(),
            gender: form.querySelector('input[name="gender"]:checked')?.value || "Male",
            dob: form.dob.value,
            address: form.address.value.trim()
        });
        console.log("Section 1 (Personal Details) Object:", formData.personalDetails);
    }

    // Update Section 2 data in the same object
    function saveSection2() {
        Object.assign(formData.qualificationDetails, {
            highestQualification: form.highestQualification.value,
            fieldOfStudy: form.fieldOfStudy.value.trim(),
            institution: form.institution.value.trim(),
            passingYear: Number(form.passingYear.value),
            cgpaOrPercentage: Number(form.cgpaOrPercentage.value),
            skills: form.skills.value.trim(),
            certifications: form.certifications.value.trim() || "None"
        });
        console.log("Section 2 (Qualification Details) Object:", formData.qualificationDetails);
    }

    // Update Section 3 data in the same object (sets all to null if noExperience checked)
    function saveSection3() {
        const isNoExp = noExpCheckbox && noExpCheckbox.checked;

        if (isNoExp) {
            // All experience section values store null as requested
            Object.assign(formData.experienceDetails, {
                noExperience: true,
                experienceStatus: null,
                jobTitle: null,
                companyName: null,
                yearsOfExperience: null,
                linkedinUrl: null,
                portfolioUrl: null,
                resume: null,
                termsAccepted: form.terms.checked
            });
        } else {
            Object.assign(formData.experienceDetails, {
                noExperience: false,
                experienceStatus: form.experienceStatus.value,
                jobTitle: form.jobTitle.value.trim(),
                companyName: form.companyName.value.trim(),
                yearsOfExperience: Number(expSlider ? expSlider.value : 0),
                linkedinUrl: form.linkedinUrl.value.trim(),
                portfolioUrl: form.portfolioUrl ? form.portfolioUrl.value.trim() || null : null,
                resume: uploadedFile ? { name: uploadedFile.name, size: `${(uploadedFile.size / 1024).toFixed(1)} KB`, type: uploadedFile.type } : null,
                termsAccepted: form.terms.checked
            });
        }
        console.log("Section 3 (Experience Details) Object:", formData.experienceDetails);
    }

    // Live validation listeners
    form.addEventListener("input", validateCurrentStep);
    form.addEventListener("change", validateCurrentStep);

    // Switch section view without page scrolling
    function showStep(stepNum) {
        currentStep = stepNum;
        steps.forEach((s, idx) => s.classList.toggle("active", idx === stepNum - 1));

        stepItems.forEach((item, idx) => {
            const s = idx + 1;
            item.classList.remove("active", "completed");
            if (s === currentStep) item.classList.add("active");
            else if (s < currentStep) item.classList.add("completed");
        });

        lineFills[0].style.width = currentStep > 1 ? "100%" : "0%";
        lineFills[1].style.width = currentStep > 2 ? "100%" : "0%";
        validateCurrentStep();
    }

    // Previous Buttons: navigate back without resetting inputs (ready for corrections)
    document.getElementById("prevStep2").addEventListener("click", () => {
        showStep(1);
        showPopup("Section 1", "You can correct your personal details.");
    });

    document.getElementById("prevStep3").addEventListener("click", () => {
        showStep(2);
        showPopup("Section 2", "You can correct your qualification details.");
    });

    // Section 1 Next: validate mobile, password & update the same personalDetails object
    document.getElementById("nextStep1").addEventListener("click", () => {
        if (!validateSection(1)) {
            showPopup("Invalid Input", "Please enter valid personal details, 10-digit mobile, and password (1 uppercase, 1 number, 1 special character).", true);
            return;
        }
        saveSection1();
        showPopup("Section 1 Saved", "Personal details updated.");
        showStep(2);
    });

    // Section 2 Next: update the same qualificationDetails object
    document.getElementById("nextStep2").addEventListener("click", () => {
        if (!validateSection(2)) {
            showPopup("Incomplete Fields", "Please complete all fields in Section 2.", true);
            return;
        }
        saveSection2();
        showPopup("Section 2 Saved", "Qualification details updated.");
        showStep(3);
    });

    // Section 3 Submit: update experienceDetails & log full object (No console.table!)
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!validateSection(3)) {
            showPopup("Incomplete Fields", "Please complete experience details (or check No Experience) and accept terms.", true);
            return;
        }

        saveSection3();
        formData.submittedAt = new Date().toISOString();

        // Output final data in console in pure Object format (NO table format)
        console.log("Final Submitted Data :", formData);

        window.allFormData = formData;

        // Turn Button 1, 2, AND 3 to Green (Completed)
        stepItems.forEach(item => {
            item.classList.remove("active");
            item.classList.add("completed");
        });
        lineFills[0].style.width = "100%";
        lineFills[1].style.width = "100%";

        // Hide form steps & show success message
        steps.forEach(s => s.style.display = "none");
        document.getElementById("successCard").style.display = "block";

        // ONLY Popup Notification (No browser alert dialog!)
        showPopup("Application Submitted!", "All sections stored in object format.");
    });

    // Clear Button Handler for each section
    function clearSection(stepNum) {
        const stepEl = steps[stepNum - 1];
        stepEl.querySelectorAll("input:not([type=radio]), select, textarea").forEach(el => el.value = "");
        if (stepNum === 1) {
            const male = stepEl.querySelector('input[name="gender"][value="Male"]');
            if (male) male.checked = true;
            phoneHint.textContent = "Enter a valid 10-digit mobile number";
            phoneHint.className = "phone-hint";
            formData.personalDetails = {};
        }
        if (stepNum === 2) {
            formData.qualificationDetails = {};
        }
        if (stepNum === 3) {
            if (noExpCheckbox) {
                noExpCheckbox.checked = false;
                expWrapper.classList.remove("disabled-experience");
            }
            setResume(null);
            document.getElementById("termsCheckbox").checked = false;
            if (expSlider) { expSlider.value = 2; expBadge.textContent = "2 Years"; }
            formData.experienceDetails = {};
        }
        validateCurrentStep();
        showPopup(`Section ${stepNum} Cleared`, "Inputs have been cleared.");
    }

    document.getElementById("clearStep1").addEventListener("click", () => clearSection(1));
    document.getElementById("clearStep2").addEventListener("click", () => clearSection(2));
    document.getElementById("clearStep3").addEventListener("click", () => clearSection(3));

    // Reset whole form from success card
    document.getElementById("startOverBtn").addEventListener("click", () => {
        form.reset();
        setResume(null);
        if (noExpCheckbox) {
            noExpCheckbox.checked = false;
            expWrapper.classList.remove("disabled-experience");
        }
        phoneHint.textContent = "Enter a valid 10-digit mobile number";
        phoneHint.className = "phone-hint";
        formData.personalDetails = {};
        formData.qualificationDetails = {};
        formData.experienceDetails = {};
        steps.forEach(s => s.style.display = "");
        document.getElementById("successCard").style.display = "none";
        showStep(1);
    });

    // Initial validation check
    validateCurrentStep();
});
