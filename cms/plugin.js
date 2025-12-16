/**
 * @bootstrapp/cms - Admin Plugin
 * Registers CMS features with the admin plugin system
 */

import { registerPlugin } from "/$app/admin/plugins.js";
import { html } from "/npm/lit-html";

// Import CMS field components
import "./fields/rich-text.js";
import "./fields/media-picker.js";
import "./fields/seo-fields.js";

$APP.addModule({ name: "cms", path: "/$app/cms/views" });
registerPlugin("cms", {
  /**
   * Custom field type renderers
   * These are used by the form generator to render CMS-specific fields
   */
  fieldTypes: {
    richText: (field, value, onChange) => html`
      <cms-rich-text
        .value=${value || ""}
        .field=${field}
        @change=${(e) => onChange(e.detail)}
      ></cms-rich-text>
    `,

    media: (field, value, onChange) => html`
      <cms-media-picker
        .value=${value || ""}
        .field=${field}
        @change=${(e) => onChange(e.detail)}
      ></cms-media-picker>
    `,

    seo: (field, value, onChange) => html`
      <cms-seo-fields
        .value=${value || {}}
        .field=${field}
        @change=${(e) => onChange(e.detail)}
      ></cms-seo-fields>
    `,

    publishStatus: (field, value, onChange) => html`
      <cms-publishing-bar
        .status=${value || "draft"}
        @status-change=${(e) => onChange(e.detail)}
      ></cms-publishing-bar>
    `,
  },

  /**
   * Sidebar items for admin navigation
   */
  sidebar: [
    {
      label: "Content",
      icon: "file-text",
      href: "/admin/content",
    },
    {
      label: "Media Library",
      icon: "image",
      href: "/admin/media-library",
    },
  ],

  /**
   * Additional routes for CMS features
   */
  routes: {
    "/admin/content": {
      name: "cms-dashboard",
      component: () => html`<cms-dashboard></cms-dashboard>`,
      title: "Content Management",
      template: "admin-layout",
    },
    "/admin/content/:model/new": {
      name: "cms-editor-new",
      component: ({ model }) => html`
        <cms-editor model=${model}></cms-editor>
      `,
      title: "New Content",
      template: "admin-layout",
    },
    "/admin/content/:model/:id": {
      name: "cms-editor",
      component: ({ model, id }) => html`
        <cms-editor model=${model} contentId=${id} .data-query=${{ model, id: Number(id), key: "content" }}></cms-editor>
      `,
      title: "Edit Content",
      template: "admin-layout",
    },
    "/admin/content/:model": {
      name: "cms-content-list",
      component: ({ model }) => html`
        <cms-content-list
          model=${model}
          .data-query=${{ model, key: "items" }}
        ></cms-content-list>
      `,
      title: "Content",
      template: "admin-layout",
    },
    "/admin/media-library": {
      name: "cms-media-library",
      component: () => html`
        <cms-media-library
          .data-query=${{ model: "cms_media", key: "media" }}
        ></cms-media-library>
      `,
      title: "Media Library",
      template: "admin-layout",
    },
  },
});

console.log("[CMS] Plugin registered");
