import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-contact-avatar",
  properties: {
    name: T.string(""),
    src: T.string(""),
    size: T.string({
      defaultValue: "md",
      enum: ["xs", "sm", "md", "lg", "xl"],
    }),
    status: T.string({
      defaultValue: "",
      enum: ["", "online", "offline", "busy", "away"],
    }),
    href: T.string(""),
  },
  style: true,
  shadow: true,

  render() {
    const content = html`
      <div part="contact" class="contact">
        <uix-avatar
          part="avatar"
          name=${this.name}
          src=${this.src}
          size=${this.size}
          status=${this.status}
        ></uix-avatar>
        <div part="name" class="contact-name">
          ${this.name}
        </div>
      </div>
    `;

    return this.href
      ? html`<a href=${this.href} part="link" class="contact-link">${content}</a>`
      : content;
  },
};

/**
 * Contact Avatar Component
 *
 * @component
 * @category page
 * @tag uix-contact-avatar
 *
 * A simple contact item displaying an avatar with a name label below.
 * Perfect for contact lists, recent contacts, team members, etc.
 *
 * @property {string} name - Contact name (used for avatar initials and label)
 * @property {string} src - Avatar image URL
 * @property {string} size - Avatar size: xs, sm, md, lg, xl (default: md)
 * @property {string} status - Status indicator: online, offline, busy, away
 * @property {string} href - Optional link URL (makes contact clickable)
 *
 * @part contact - The contact container
 * @part avatar - The avatar element
 * @part name - The name label
 * @part link - The link wrapper (when href is provided)
 *
 * @example Basic Usage
 * ```html
 * <uix-contact-avatar name="John Doe"></uix-contact-avatar>
 * ```
 *
 * @example With Image and Status
 * ```html
 * <uix-contact-avatar
 *   name="Sarah Johnson"
 *   src="/avatars/sarah.jpg"
 *   status="online"
 *   size="lg"
 * ></uix-contact-avatar>
 * ```
 *
 * @example Contact List
 * ```html
 * <uix-flex gap="lg">
 *   <uix-contact-avatar name="Jeff Wilson"></uix-contact-avatar>
 *   <uix-contact-avatar name="Clara Martinez" status="online"></uix-contact-avatar>
 *   <uix-contact-avatar name="Burak Yilmaz" status="busy"></uix-contact-avatar>
 *   <uix-contact-avatar name="Sheila Brown"></uix-contact-avatar>
 * </uix-flex>
 * ```
 *
 * @example Clickable Contacts
 * ```html
 * <uix-grid columns="4" gap="lg">
 *   <uix-contact-avatar name="Alice" href="/user/alice"></uix-contact-avatar>
 *   <uix-contact-avatar name="Bob" href="/user/bob"></uix-contact-avatar>
 *   <uix-contact-avatar name="Carol" href="/user/carol"></uix-contact-avatar>
 *   <uix-contact-avatar name="Dave" href="/user/dave"></uix-contact-avatar>
 * </uix-grid>
 * ```
 */
