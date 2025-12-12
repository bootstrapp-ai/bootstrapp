/**
 * UIX Showcase Sidebar
 * Navigation for component categories and components using UIX components
 */

import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
import View from "/$app/view/index.js";

const resources = [
  { id: "installation", label: "Installation", icon: "download" },
  { id: "usage", label: "Usage", icon: "book-open" },
  { id: "themes", label: "Themes", icon: "droplet" },
  { id: "theme-generator", label: "Theme Generator", icon: "sliders-vertical" },
];
const categoryIcons = {
  display: "eye",
  form: "list-checks",
  overlay: "layers",
  layout: "layout-grid",
  navigation: "compass",
  feedback: "loader",
  utility: "pen-tool",
};

const ShowcaseSidebarDefinition = {
  tag: "uix-showcase-sidebar",
  properties: {
    componentList: T.object(), // Component categories and names
    selectedCategory: T.string({ sync: "querystring" }), // Currently selected category
    selectedComponent: T.string({ sync: "querystring" }), // Currently selected component
    selectedResourcePage: T.string({ sync: "querystring" }), // Currently selected resource page
    searchQuery: T.string(""), // Search filter
  },
  selectComponent(category, name) {
    this.emit("select", { type: "component", category, name });
  },
  selectResource(page) {
    this.emit("select", { type: "resource", page });
  },
  filterComponents(components, query) {
    if (!query) return components;
    const lowerQuery = query.toLowerCase();
    return components.filter((name) => name.toLowerCase().includes(lowerQuery));
  },
  getCategoryIcon(category) {
    return categoryIcons[category] || "package";
  },
  render() {
    if (!this.componentList || Object.keys(this.componentList).length === 0) {
      return html`
        <div part="container" class="sidebar-container">
          <div class="empty-state">
            <p>No components found</p>
          </div>
        </div>
      `;
    }

    return html`
      <div part="container" class="sidebar-container">
        <!-- Search Input -->
        <uix-container part="search" padding="md">
            <uix-input
              w-full
              type="search"
              placeholder="Search components..."
              class="search-input"
              .value=${this.searchQuery}
              @input=${(e) => {
                this.searchQuery = e.target.value;
              }}
            >
            <uix-icon name="search"></uix-icon>
          </uix-input>
        </uix-container>

        <uix-accordion>
          <uix-nav-item
            prevent-collapse
            open
            icon="book"
            label="Resources"
          >
          </uix-nav-item>
          <uix-menu>
            ${resources.map(
              (resource) => html`
                <uix-nav-item
                  icon=${resource.icon}
                  label=${resource.label}
                  size="sm"
                  ?active=${this.selectedResourcePage === resource.id}
                  ?activeBg=${this.selectedResourcePage === resource.id}
                  @nav-item-click=${() => this.selectResource(resource.id)}
                ></uix-nav-item>
              `,
            )}
          </uix-menu>

          <!-- Component Categories -->
          ${Object.entries(this.componentList).map(([category, components]) => {
            const filteredComponents = this.filterComponents(
              components,
              this.searchQuery,
            );
            const componentCount = filteredComponents.length;

            // Hide category if no matches after filtering
            if (componentCount === 0 && this.searchQuery) return null;

            const hasSelection = this.selectedCategory === category;

            return html`
              <uix-nav-item
                ?open=${hasSelection}
                icon=${this.getCategoryIcon(category)}
                label=${category}
                badge=${componentCount}
                header
              >
              </uix-nav-item>
              <uix-menu>
                ${filteredComponents.map((name) => {
                  const isSelected =
                    this.selectedCategory === category &&
                    this.selectedComponent === name;

                  return html`
                    <uix-nav-item
                      label=${name}
                      size="sm"
                      ?active=${isSelected}
                      ?activeBg=${isSelected}
                      @nav-item-click=${() =>
                        this.selectComponent(category, name)}
                    ></uix-nav-item>
                  `;
                })}
              </uix-menu>
            `;
          })}
        </uix-accordion>
      </div>
    `;
  },
};

View.define("uix-showcase-sidebar", ShowcaseSidebarDefinition);

export default ShowcaseSidebarDefinition;
