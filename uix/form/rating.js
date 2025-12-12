import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";
export default {
  tag: "uix-rating",
  style: true,
  properties: {
    value: T.number({ defaultValue: 0 }),
    max: T.number({ defaultValue: 5 }),
    readonly: T.boolean({ defaultValue: false }),
    change: T.function(),
  },
  render() {
    const { value, max, readonly, change } = this;

    return html`
      <div horizontal class="uix-rating__container">
        ${Array.from({ length: max }, (_, index) => {
          const isFilled = index < value;
          const isHalf = index + 0.5 === value;
          return html`
            <uix-icon
              name=${isHalf ? "star-half" : "star"}
              ?filled=${isFilled}
              @click=${() => !readonly && change(index + 1)}
            ></uix-icon>
          `;
        })}
      </div>
    `;
  },
};
