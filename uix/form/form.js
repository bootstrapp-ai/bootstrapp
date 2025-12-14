import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-form",
  style: true,

  properties: {
    fields: T.array({ defaultValue: [] }),
    data: T.object({ defaultValue: {} }),
    loading: T.boolean({ defaultValue: false }),
    typeHandlers: T.object({ attribute: false }),
    errors: T.object({ defaultValue: {} }),
  },

  setErrors(errorData) {
    if (!errorData?.data) {
      this.errors = {};
      return;
    }

    const errors = {};
    for (const [field, err] of Object.entries(errorData.data)) {
      errors[field] = typeof err === "object" ? err.message : err;
    }
    this.errors = errors;
  },

  clearErrors() {
    this.errors = {};
  },

  submit() {
    const form = this.querySelector("form");
    if (form) form.requestSubmit();
  },

  getFormControls() {
    return this.querySelectorAll(
      "uix-input, uix-select, uix-textarea, uix-checkbox, uix-switch, input, select, textarea",
    );
  },

  // Get field config by name to determine expected type
  getFieldConfig(name) {
    return this.fields?.find((f) => f.name === name) || {};
  },

  collectFormData() {
    const controls = this.getFormControls();
    const data = {};

    controls.forEach((el) => {
      const name = el.getAttribute("name") || el.name;
      if (!name) return;

      const tagName = el.tagName.toLowerCase();
      const fieldConfig = this.getFieldConfig(name);

      // Handle checkboxes/switches
      if (
        tagName === "uix-checkbox" ||
        tagName === "uix-switch" ||
        el.type === "checkbox"
      ) {
        data[name] = el.checked === true;
        return;
      }

      // Handle number inputs
      if (el.type === "number" || el.getAttribute("type") === "number") {
        const val = el.value;
        data[name] =
          val !== "" && val !== null && val !== undefined
            ? parseFloat(val)
            : null;
        return;
      }

      // Handle multi-select (by attribute or field config)
      const isMultiple =
        el.multiple ||
        el.hasAttribute("multiple") ||
        fieldConfig.type === "multi-select";

      if (isMultiple) {
        const value = el.value;
        if (Array.isArray(value)) {
          data[name] = value;
        } else if (value && value !== "") {
          // Single value in a multi-select, wrap in array
          data[name] = [value];
        } else {
          data[name] = [];
        }
        return;
      }

      // Default: string values, convert empty string to null
      const value = el.value;
      data[name] = value === "" || value === undefined ? null : value;
    });

    return data;
  },

  serialize(formData) {
    const result = { ...formData };

    for (const field of this.fields || []) {
      const value = result[field.name];
      if (value === undefined || value === null) continue;

      // Custom type handlers
      if (this.typeHandlers?.[field.type]) {
        result[field.name] =
          this.typeHandlers[field.type].serialize?.(value, field) ?? value;
        continue;
      }

      // Built-in type handlers
      switch (field.type) {
        case "textarea":
          if (
            field.name.includes("json") ||
            typeof field.defaultValue === "object"
          ) {
            try {
              result[field.name] = JSON.parse(value);
            } catch {
              // Keep as string
            }
          }
          break;
        case "number":
          if (typeof value === "string") {
            result[field.name] = value === "" ? null : parseFloat(value) || 0;
          }
          break;
        case "switch":
        case "checkbox":
          if (typeof value === "string") {
            result[field.name] = value === "true" || value === "1";
          }
          break;
      }
    }

    return result;
  },

  deserialize(record) {
    const result = { ...record };

    for (const field of this.fields || []) {
      const value = result[field.name];
      if (value === undefined) continue;

      // Custom type handlers
      if (this.typeHandlers?.[field.type]) {
        result[field.name] =
          this.typeHandlers[field.type].deserialize?.(value, field) ?? value;
        continue;
      }

      // Built-in type handlers
      switch (field.type) {
        case "textarea":
          if (
            Array.isArray(value) ||
            (typeof value === "object" && value !== null)
          ) {
            result[field.name] = JSON.stringify(value, null, 2);
          }
          break;
        case "date":
          if (value) {
            result[field.name] = new Date(value).toISOString().split("T")[0];
          }
          break;
        case "datetime-local":
          if (value) {
            result[field.name] = new Date(value).toISOString().slice(0, 16);
          }
          break;
      }
    }

    return result;
  },

  _handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    this.errors = {}; // Clear previous errors

    const rawData = this.collectFormData();
    const serialized = this.serialize(rawData);
    this.emit("form-submit", serialized);
  },

  renderField(field, value) {
    const renderers = {
      textarea: () => html`
        <uix-textarea
          name=${field.name}
          label=${field.label}
          value=${value || ""}
          ?required=${field.required}
          placeholder=${field.placeholder || ""}
          rows=${field.rows || 3}
        ></uix-textarea>
      `,

      select: () => {
        const rawOptions = field.options || [];
        const normalizedOptions = Array.isArray(rawOptions)
          ? rawOptions.map((opt) => ({
              value: typeof opt === "object" ? opt.value : opt,
              label: typeof opt === "object" ? opt.label : opt,
            }))
          : [];
        return html`
          <uix-select
            name=${field.name}
            label=${field.label}
            ?required=${field.required}
            value=${value || ""}
            placeholder="Select..."
            .options=${normalizedOptions}
          ></uix-select>
        `;
      },

      "multi-select": () => {
        const multiOptions = field.options || [];
        const normalizedOptions = Array.isArray(multiOptions)
          ? multiOptions.map((opt) => ({
              value: typeof opt === "object" ? opt.value : opt,
              label: typeof opt === "object" ? opt.label : opt,
            }))
          : [];
        return html`
          <uix-select
            name=${field.name}
            label=${field.label}
            multiple
            ?required=${field.required}
            value=${Array.isArray(value) ? value : []}
            .options=${normalizedOptions}
          ></uix-select>
        `;
      },

      switch: () => html`
        <uix-checkbox
          name=${field.name}
          ?checked=${value === true}
          label=${field.checkboxLabel || `Enable ${field.label}`}
        ></uix-checkbox>
      `,

      checkbox: () => html`
        <uix-checkbox
          name=${field.name}
          ?checked=${value === true}
          label=${field.checkboxLabel || `Enable ${field.label}`}
        ></uix-checkbox>
      `,

      number: () => html`
        <uix-input
          type="number"
          name=${field.name}
          label=${field.label}
          value=${value ?? ""}
          ?required=${field.required}
          placeholder=${field.placeholder || ""}
          step="any"
        ></uix-input>
      `,

      date: () => html`
        <uix-input
          type="date"
          name=${field.name}
          label=${field.label}
          value=${value || ""}
          ?required=${field.required}
        ></uix-input>
      `,

      "datetime-local": () => html`
        <uix-input
          type="datetime-local"
          name=${field.name}
          label=${field.label}
          value=${value || ""}
          ?required=${field.required}
        ></uix-input>
      `,

      time: () => html`
        <uix-input
          type="time"
          name=${field.name}
          label=${field.label}
          value=${value || ""}
          ?required=${field.required}
        ></uix-input>
      `,

      email: () => html`
        <uix-input
          type="email"
          name=${field.name}
          label=${field.label}
          value=${value || ""}
          ?required=${field.required}
          placeholder=${field.placeholder || "email@example.com"}
        ></uix-input>
      `,

      url: () => html`
        <uix-input
          type="url"
          name=${field.name}
          label=${field.label}
          value=${value || ""}
          ?required=${field.required}
          placeholder=${field.placeholder || "https://"}
        ></uix-input>
      `,

      password: () => html`
        <uix-input
          type="password"
          name=${field.name}
          label=${field.label}
          value=${value || ""}
          ?required=${field.required}
          placeholder=${field.placeholder || ""}
        ></uix-input>
      `,

      tel: () => html`
        <uix-input
          type="tel"
          name=${field.name}
          label=${field.label}
          value=${value || ""}
          ?required=${field.required}
          placeholder=${field.placeholder || ""}
        ></uix-input>
      `,
    };

    const defaultRenderer = () => html`
      <uix-input
        type="text"
        name=${field.name}
        label=${field.label}
        value=${value || ""}
        ?required=${field.required}
        placeholder=${field.placeholder || ""}
      ></uix-input>
    `;

    return (renderers[field.type] || defaultRenderer)();
  },

  render() {
    const formData = this.deserialize(this.data || {});

    return html`
      <form @submit=${this._handleSubmit}>
        ${this.fields.map((field) => {
          const error = this.errors?.[field.name];
          return html`
            <div class="form-field ${error ? "has-error" : ""}">
              ${this.renderField(field, formData[field.name])}
              ${error ? html`<span class="form-error">${error}</span>` : ""}
            </div>
          `;
        })}
      </form>
    `;
  },
};
