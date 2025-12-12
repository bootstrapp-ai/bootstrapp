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

    // Include ID for edits
    if (this.row?.id) {
      data.id = this.row.id;
    }

    const serialized = serializeFormData(data, fields);

    this.emit("submit", serialized);
    this.loading = false;
  },

  renderField(field, value) {
    const baseClasses = `w-full px-4 py-3 border-3 border-black rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-black
                         disabled:bg-gray-100 disabled:cursor-not-allowed`;

    switch (field.type) {
      case "textarea":
        return html`
          <textarea
            name=${field.name}
            .value=${value || ""}
            ?required=${field.required}
            placeholder=${field.placeholder || ""}
            rows=${field.rows || 3}
            class=${baseClasses + " resize-y"}
          ></textarea>
        `;

      case "select":
        const options = field.options || this.relationshipOptions[field.name] || [];
        return html`
          <select name=${field.name} ?required=${field.required} class=${baseClasses}>
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
          </select>
        `;

      case "multi-select":
        const multiOptions = this.relationshipOptions[field.name] || [];
        const selectedValues = Array.isArray(value) ? value : [];
        return html`
          <select
            name=${field.name}
            multiple
            ?required=${field.required}
            class=${baseClasses + " min-h-[120px]"}
          >
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
          </select>
        `;

      case "switch":
      case "checkbox":
        return html`
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name=${field.name}
              ?checked=${value === true}
              class="w-5 h-5 border-3 border-black rounded"
            />
            <span class="text-sm text-gray-600">Enable ${field.label}</span>
          </label>
        `;

      case "number":
        return html`
          <input
            type="number"
            name=${field.name}
            .value=${value ?? ""}
            ?required=${field.required}
            placeholder=${field.placeholder || ""}
            step="any"
            class=${baseClasses}
          />
        `;

      case "date":
        return html`
          <input
            type="date"
            name=${field.name}
            .value=${value || ""}
            ?required=${field.required}
            class=${baseClasses}
          />
        `;

      case "datetime-local":
        return html`
          <input
            type="datetime-local"
            name=${field.name}
            .value=${value || ""}
            ?required=${field.required}
            class=${baseClasses}
          />
        `;

      case "time":
        return html`
          <input
            type="time"
            name=${field.name}
            .value=${value || ""}
            ?required=${field.required}
            class=${baseClasses}
          />
        `;

      case "email":
        return html`
          <input
            type="email"
            name=${field.name}
            .value=${value || ""}
            ?required=${field.required}
            placeholder=${field.placeholder || "email@example.com"}
            class=${baseClasses}
          />
        `;

      case "url":
        return html`
          <input
            type="url"
            name=${field.name}
            .value=${value || ""}
            ?required=${field.required}
            placeholder=${field.placeholder || "https://"}
            class=${baseClasses}
          />
        `;

      case "password":
        return html`
          <input
            type="password"
            name=${field.name}
            .value=${value || ""}
            ?required=${field.required}
            placeholder=${field.placeholder || ""}
            class=${baseClasses}
          />
        `;

      case "tel":
        return html`
          <input
            type="tel"
            name=${field.name}
            .value=${value || ""}
            ?required=${field.required}
            placeholder=${field.placeholder || ""}
            class=${baseClasses}
          />
        `;

      default:
        return html`
          <input
            type="text"
            name=${field.name}
            .value=${value || ""}
            ?required=${field.required}
            placeholder=${field.placeholder || ""}
            class=${baseClasses}
          />
        `;
    }
  },

  render() {
    const { model, row, loading } = this;
    const isEdit = !!row?.id;
    const fields = getFormFields(model, isEdit);
    const formData = isEdit ? deserializeForForm(row, fields) : {};

    return html`
      <form @submit=${this.handleSubmit} class="space-y-6">
        ${fields.map(
          (field) => html`
            <div class="space-y-2">
              <label class="flex items-center gap-2 font-bold text-sm">
                ${field.label}
                ${field.required
                  ? html`<span class="text-red-500">*</span>`
                  : ""}
              </label>
              ${this.renderField(field, formData[field.name])}
            </div>
          `,
        )}

        <!-- Form Actions -->
        <div class="flex items-center justify-between pt-6 border-t-2 border-gray-200">
          ${isEdit
            ? html`
                <button
                  type="button"
                  @click=${() => this.emit("delete")}
                  class="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50
                         rounded-lg transition-colors"
                >
                  <uix-icon name="trash" size="18"></uix-icon>
                  Delete
                </button>
              `
            : html`<div></div>`}

          <button
            type="submit"
            ?disabled=${loading}
            class="flex items-center gap-2 px-8 py-3 bg-black text-white font-bold
                   rounded-xl border-3 border-black
                   shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]
                   hover:translate-x-[2px] hover:translate-y-[2px]
                   hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]
                   transition-all duration-150
                   disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ${loading
              ? html`<uix-spinner size="sm"></uix-spinner>`
              : html`<uix-icon name=${isEdit ? "save" : "plus"} size="20"></uix-icon>`}
            ${isEdit ? "Save Changes" : "Create"}
          </button>
        </div>
      </form>
    `;
  },
};
