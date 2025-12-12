import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";
import $APP from "/node_modules/@bootstrapp/base/app.js";
import Model from "/node_modules/@bootstrapp/model/index.js";
export default {
  tag: "cms-form",
  properties: {
    row: T.object(),
    label: T.string(),
    props: T.object(),
    close: T.function(),
    submit: T.function(),
    confirmingRemove: T.boolean(),
  },
  handleSubmit() {
    const { model, id } = this["data-query"];
    const form = this.q("uix-form");
    const data = form.formData();
    if (id) data.id = id;
    const valid =
      form.validate() && (!this.submit || this.submit(data) === true);
    if (valid) {
      if (data.id) Model[model].edit(data);
      else Model[model].add(data);
      form.reset();
      this.close?.();
    }
  },

  removeRowAndCloseModal() {
    this.row.remove();
    this.close?.();
  },

  promptRemoveConfirmation() {
    this.confirmingRemove = this["data-query"].id;
  },

  cancelRemove() {
    this.confirmingRemove = null;
  },

  async connected() {
    const { model } = this["data-query"];
    this.props = this.props || $APP.models[model] || {};
  },
  _renderRemoveControls() {
    return html`
		<div class="flex items-center gap-2">
    ${
      this["data-query"].id && this.confirmingRemove !== this["data-query"].id
        ? html`<uix-button
                label="Remove"
                variant="danger-outline"
                @click=${this.promptRemoveConfirmation.bind(this)}
            ></uix-button>`
        : html`<span class="text-lg font-bold">Are you sure?</span>
                    <uix-join>
											<uix-button
													label="Yes, Remove"
													class="bg-red"
													@click=${this.removeRowAndCloseModal.bind(this)}
											></uix-button>
											<uix-button												
													label="No"
													@click=${this.cancelRemove.bind(this)}
											></uix-button>
										</uix-join>`
    }		            
                </div>
        `;
  },
  render() {
    const { label, props = {}, row } = this;
    const { model, id } = this["data-query"];
    const isUpdate = !!id;
    return html`<uix-form
            class="flex flex-col gap-4"
            title=${isUpdate ? "Update" : "New"}
            .handleSubmit=${this.handleSubmit.bind(this)}
            id=${model + (isUpdate ? "-update-form" : "-new-form")}
            name="uixCRUDForm"
          >
					<h2 class="text-4xl font-bold">${label}</h2>
            ${Object.keys(props).map((columnKey) => {
              const field = props[columnKey];
              return html`<uix-input
                  type=${
                    field.input ||
                    (field.type?.name
                      ? field.type.name.toLowerCase()
                      : field.type || "input")
                  }
                  .validate=${field.validate}
                  .retrieve=${field.retrieve}
                  .name=${columnKey}
                  .label=${field.label}
                  .value=${row?.[columnKey] ?? field.value}
                  .placeholder=${field.placeholder}
                  .rows=${field.rows}
                  .options=${field.options}
                  ?autofocus=${field.autofocus}
                  ?disabled=${field.disabled}
                  ?required=${field.required}
                ></uix-input>`;
            })}
            <div class="flex justify-between gap-4 mt-4">
              <div>
                ${isUpdate ? this._renderRemoveControls() : ""}
              </div>								
              <uix-button
                slot="cta"
                type="submit"
                label=${isUpdate ? `Update ${model}` : `Create ${model}`}
              >
              </uix-button>
            </div>
          </uix-form>`;
  },
};
