import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
import { getFormFields, loadRelationshipOptions } from "../utils/form-generator.js";

export default {
  tag: "admin-model-form",
  style: true,
  properties: {
    model: T.string(),
    row: T.object(),
    enrichedFields: T.array({ defaultValue: [] }),
    loading: T.boolean({ defaultValue: false }),
  },

  async connected() {
    await this.loadFields();
  },

  async loadFields() {
    const isEdit = !!this.row?.id;
    const fields = getFormFields(this.model, isEdit);

    // Enrich fields with relationship options
    const enriched = await Promise.all(
      fields.map(async (field) => {
        if (field.relationship && field.targetModel) {
          const options = await loadRelationshipOptions(field.targetModel);
          return { ...field, options };
        }
        return field;
      }),
    );

    this.enrichedFields = enriched;
  },

  submit() {
    const form = this.querySelector("uix-form");
    if (form) form.submit();
  },

  handleFormSubmit(e) {
    const data = e.detail;
    if (this.row?.id) {
      data.id = this.row.id;
    }
    this.emit("form-submit", data);
  },

  render() {
    return html`
      <uix-form
        .fields=${this.enrichedFields}
        .data=${this.row || {}}
        @form-submit=${this.handleFormSubmit}
      ></uix-form>
    `;
  },
};
