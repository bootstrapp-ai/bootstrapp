import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
import $APP from "/$app.js";
import {
  getFormFields,
  loadRelationshipOptions,
  deserializeForForm,
  serializeFormData,
} from "../utils/form-generator.js";

export default {
  tag: "admin-model-form",
  style: true,
  properties: {
    model: T.string(),
    row: T.object(),
    relationshipOptions: T.object({ defaultValue: {} }),
    loading: T.boolean({ defaultValue: false }),
  },

  async connected() {
    await this.loadRelationships();
  },

  async loadRelationships() {
    const fields = getFormFields(this.model, !!this.row?.id);
    const relationshipFields = fields.filter((f) => f.relationship && f.targetModel);

    const options = {};
    for (const field of relationshipFields) {
      options[field.name] = await loadRelationshipOptions(field.targetModel);
    }
    this.relationshipOptions = options;
  },

  async handleSubmit(e) {
    e.preventDefault();
    this.loading = true;

    const form = e.target;
    const formData = new FormData(form);
    const fields = getFormFields(this.model, !!this.row?.id);

    const data = {};
    for (const field of fields) {
      if (field.type === "switch" || field.type === "checkbox") {
        data[field.name] = formData.get(field.name) === "on";
      } else if (field.type === "number") {
        const val = formData.get(field.name);
        data[field.name] = val ? parseFloat(val) : null;
      } else if (field.type === "multi-select") {
        data[field.name] = formData.getAll(field.name);
      } else {
        data[field.name] = formData.get(field.name) || null;
      }
    }

    if (this.row?.id) {
      data.id = this.row.id;
    }

    const serialized = serializeFormData(data, fields);

    this.emit("submit", serialized);
    this.loading = false;
  },

  renderField(field, value) {
    switch (field.type) {
      case "textarea":
        return html`
          <uix-textarea
            name=${field.name}
            .value=${value || ""}
            ?required=${field.required}
            placeholder=${field.placeholder || ""}
            rows=${field.rows || 3}
          ></uix-textarea>
        `;

      case "select":
        const options = field.options || this.relationshipOptions[field.name] || [];
        return html`
          <uix-select name=${field.name} ?required=${field.required} .value=${value || ""}>
            <option value="">Select...</option>
            ${Array.isArray(options)
              ? options.map((opt) => {
                  const optValue = typeof opt === "object" ? opt.value : opt;
                  const optLabel = typeof opt === "object" ? opt.label : opt;
                  return html`
                    <option value=${optValue} ?selected=${value === optValue}>
                      ${optLabel}
                    </option>
                  `;
                })
              : ""}
          </uix-select>
        `;

      case "multi-select":
        const multiOptions = this.relationshipOptions[field.name] || [];
        const selectedValues = Array.isArray(value) ? value : [];
        return html`
          <uix-select name=${field.name} multiple ?required=${field.required}>
            ${multiOptions.map(
              (opt) => html`
                <option
                  value=${opt.value}
                  ?selected=${selectedValues.includes(opt.value)}
                >
                  ${opt.label}
                </option>
              `,
            )}
          </uix-select>
        `;

      case "switch":
      case "checkbox":
        return html`
          <uix-checkbox
            name=${field.name}
            ?checked=${value === true}
            label="Enable ${field.label}"
          ></uix-checkbox>
        `;

      case "number":
        return html`
          <uix-input
            type="number"
            name=${field.name}
            .value=${value ?? ""}
            ?required=${field.required}
            placeholder=${field.placeholder || ""}
            step="any"
          ></uix-input>
        `;

      case "date":
        return html`
          <uix-input
            type="date"
            name=${field.name}
            .value=${value || ""}
            ?required=${field.required}
          ></uix-input>
        `;

      case "datetime-local":
        return html`
          <uix-input
            type="datetime-local"
            name=${field.name}
            .value=${value || ""}
            ?required=${field.required}
          ></uix-input>
        `;

      case "time":
        return html`
          <uix-input
            type="time"
            name=${field.name}
            .value=${value || ""}
            ?required=${field.required}
          ></uix-input>
        `;

      case "email":
        return html`
          <uix-input
            type="email"
            name=${field.name}
            .value=${value || ""}
            ?required=${field.required}
            placeholder=${field.placeholder || "email@example.com"}
          ></uix-input>
        `;

      case "url":
        return html`
          <uix-input
            type="url"
            name=${field.name}
            .value=${value || ""}
            ?required=${field.required}
            placeholder=${field.placeholder || "https://"}
          ></uix-input>
        `;

      case "password":
        return html`
          <uix-input
            type="password"
            name=${field.name}
            .value=${value || ""}
            ?required=${field.required}
            placeholder=${field.placeholder || ""}
          ></uix-input>
        `;

      case "tel":
        return html`
          <uix-input
            type="tel"
            name=${field.name}
            .value=${value || ""}
            ?required=${field.required}
            placeholder=${field.placeholder || ""}
          ></uix-input>
        `;

      default:
        return html`
          <uix-input
            type="text"
            name=${field.name}
            .value=${value || ""}
            ?required=${field.required}
            placeholder=${field.placeholder || ""}
          ></uix-input>
        `;
    }
  },

  render() {
    const { model, row, loading } = this;
    const isEdit = !!row?.id;
    const fields = getFormFields(model, isEdit);
    const formData = isEdit ? deserializeForForm(row, fields) : {};

    return html`
      <form @submit=${this.handleSubmit} class="admin-form">
        ${fields.map(
          (field) => html`
            <div class="admin-form-field">
              <label class="admin-form-label">
                ${field.label}
                ${field.required
                  ? html`<span class="admin-form-required">*</span>`
                  : ""}
              </label>
              ${this.renderField(field, formData[field.name])}
            </div>
          `,
        )}

        <!-- Form Actions -->
        <div class="admin-form-actions">
          ${isEdit
            ? html`
                <uix-button
                  type="button"
                  ghost
                  danger
                  @click=${() => this.emit("delete")}
                >
                  <uix-icon name="trash" size="18"></uix-icon>
                  Delete
                </uix-button>
              `
            : html`<div></div>`}

          <uix-button type="submit" primary ?disabled=${loading}>
            ${loading
              ? html`<uix-spinner size="sm"></uix-spinner>`
              : html`<uix-icon name=${isEdit ? "save" : "plus"} size="20"></uix-icon>`}
            ${isEdit ? "Save Changes" : "Create"}
          </uix-button>
        </div>
      </form>
    `;
  },
};
