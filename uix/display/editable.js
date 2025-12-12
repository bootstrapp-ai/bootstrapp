import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
export default {
  tag: "uix-editable",
  properties: {
    isEditing: T.boolean(false),
    value: T.string(),
    editingValue: T.string(),
    onSave: T.function(),
  },

  connected() {
    this.editingValue = this.value;
  },

  startEditing() {
    this.isEditing = true;
    this.defer(() => this.querySelector("input")?.focus());
  },

  cancelEditing() {
    this.editingValue = this.value;
    this.isEditing = false;
  },

  async save() {
    if (this.onSave && typeof this.onSave === "function") {
      // Call the provided onSave function with the new value
      await this.onSave(this.editingValue);
    }
    this.value = this.editingValue;
    this.isEditing = false;
  },

  render() {
    if (this.isEditing) {
      // -- Edit Mode --
      return html`
                <uix-join>
                    <uix-input
                        class="text-xl font-semibold"
                        .bind=${this.prop("editingValue")}
                        @keydown=${(e) => e.key === "Enter" && this.save()}
                        @blur=${() => this.cancelEditing()}
                    ></uix-input>
                    <uix-button
                        icon="check"
                        class="is-success"
                        @click=${(e) => {
                          e.stopPropagation();
                          this.save();
                        }}
                    ></uix-button>
                    <uix-button
                        icon="x"
                        class="is-danger"
                        @click=${(e) => {
                          e.stopPropagation();
                          this.cancelEditing();
                        }}
                    ></uix-button>
                </uix-join>
            `;
    }
    // -- Display Mode --
    return html`
                <span
                    class="cursor-text text-xl font-semibold p-1 -m-1 rounded hover:bg-gray-100 cursor-pointer"
                    @click=${this.startEditing.bind(this)}
                >
                    ${this.value}
                </span>
            `;
  },
};
