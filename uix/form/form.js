import T from "/node_modules/@bootstrapp/types/index.js";

export default {
  tag: "uix-form",
  properties: {
    method: T.string({ defaultValue: "post" }),
    endpoint: T.string(),
    submit: T.function(),
    submitSuccess: T.function(),
    submitError: T.function(),
  },
  getFormControls() {
    return this.querySelectorAll("uix-input");
  },
  validate() {
    const formControls = this.getFormControls();
    return [...formControls].every((control) => control.reportValidity());
  },
  async handleSubmit(event) {
    event.preventDefault();
    if (this.submit) this.submit(event);
    if (this.submitSuccess) this.submitSuccess();

    if (!this.validate()) return;
    const formData = this.formData();
    const response = await fetch(this.endpoint, {
      method: this.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    if (!response.ok) console.error("Form submission failed", response);
  },
  reset() {
    this.getFormControls().forEach((control) => control.formResetCallback?.());
  },
  formData() {
    const formData = Object.fromEntries(
      [...this.getFormControls()].map((element) => [
        element.name,
        element?.value,
      ]),
    );
    return formData;
  },
  connected() {
    const submitButton = this.querySelector('uix-button[type="submit"]');
    if (submitButton)
      submitButton.addEventListener("click", this.handleSubmit.bind(this));
    this.addEventListener("keydown", (event) => {
      if (
        event.key !== "Enter" ||
        event.shiftKey ||
        event.ctrlKey ||
        event.altKey ||
        document.activeElement.tagName === "TEXTAREA"
      ) {
        return;
      }

      event.preventDefault();
      this.handleSubmit(event);
    });
  },
  updateFields(data) {
    const formControls = this.getFormControls();
    Object.keys(data).forEach((key) => {
      const control = [...formControls].find((control) => control.name === key);
      if (control) control.value = data[key];
    });
  },
};
