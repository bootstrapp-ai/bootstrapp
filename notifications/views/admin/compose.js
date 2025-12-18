/**
 * @bootstrapp/notifications - Admin Compose Page
 * Create and send new notifications
 */
import T from "/$app/types/index.js";
import $APP from "/$app.js";
import { html, nothing } from "/npm/lit-html";

const NOTIFICATION_TYPES = [
  { id: "system", label: "System", icon: "bell" },
  { id: "announcement", label: "Announcement", icon: "megaphone" },
  { id: "update", label: "Update", icon: "refresh-cw" },
];

export default {
  tag: "notifications-admin-compose",
  style: true,
  properties: {
    title: T.string({ defaultValue: "" }),
    message: T.string({ defaultValue: "" }),
    type: T.string({ defaultValue: "system" }),
    targetType: T.string({ defaultValue: "all" }),
    selectedUsers: T.array({ defaultValue: [] }),
    contentType: T.string({ defaultValue: "" }),
    contentSlug: T.string({ defaultValue: "" }),
    users: T.array({ defaultValue: [] }),
    sending: T.boolean({ defaultValue: false }),
    error: T.string({ defaultValue: "" }),
  },

  async connected() {
    await this.loadUsers();
  },

  async loadUsers() {
    try {
      const users = await $APP.Model.users.getAll();
      this.users = users || [];
    } catch (err) {
      console.error("Failed to load users:", err);
      this.users = [];
    }
  },

  handleTitleChange(e) {
    this.title = e.target.value;
  },

  handleMessageChange(e) {
    this.message = e.target.value;
  },

  handleTypeChange(type) {
    this.type = type;
  },

  handleTargetChange(e) {
    this.targetType = e.target.value;
    if (this.targetType === "all") {
      this.selectedUsers = [];
    }
  },

  handleUserSelect(userId) {
    if (this.selectedUsers.includes(userId)) {
      this.selectedUsers = this.selectedUsers.filter((id) => id !== userId);
    } else {
      this.selectedUsers = [...this.selectedUsers, userId];
    }
  },

  handleContentTypeChange(e) {
    this.contentType = e.target.value;
  },

  handleContentSlugChange(e) {
    this.contentSlug = e.target.value;
  },

  isValid() {
    if (!this.title.trim()) return false;
    if (!this.message.trim()) return false;
    if (this.targetType === "specific" && this.selectedUsers.length === 0) return false;
    return true;
  },

  async handleSend() {
    if (!this.isValid()) {
      this.error = "Please fill in all required fields";
      return;
    }

    this.error = "";
    this.sending = true;

    try {
      const recipients =
        this.targetType === "all"
          ? this.users.map((u) => u.id)
          : this.selectedUsers;

      await $APP.notifications.send({
        recipients,
        title: this.title.trim(),
        message: this.message.trim(),
        type: this.type,
        contentType: this.contentType || undefined,
        contentSlug: this.contentSlug || undefined,
      });

      // Navigate back to history
      $APP.Router.go("/admin/notifications");
    } catch (err) {
      console.error("Failed to send notification:", err);
      this.error = "Failed to send notification. Please try again.";
    }

    this.sending = false;
  },

  handleCancel() {
    $APP.Router.go("/admin/notifications");
  },

  render() {
    const recipientCount =
      this.targetType === "all" ? this.users.length : this.selectedUsers.length;

    return html`
      <div class="notifications-compose">
        <!-- Header -->
        <div class="notifications-compose-header">
          <button class="notifications-compose-back" @click=${() => this.handleCancel()}>
            <uix-icon name="arrow-left" size="sm"></uix-icon>
            Back
          </button>
          <h1 class="notifications-compose-title">Compose Notification</h1>
        </div>

        <div class="notifications-compose-content">
          <!-- Form -->
          <div class="notifications-compose-form">
            ${this.error
              ? html`
                  <div class="notifications-compose-error">
                    <uix-icon name="alert-circle" size="sm"></uix-icon>
                    ${this.error}
                  </div>
                `
              : nothing}

            <!-- Type Selection -->
            <div class="notifications-compose-field">
              <label class="notifications-compose-label">Notification Type</label>
              <div class="notifications-compose-types">
                ${NOTIFICATION_TYPES.map(
                  (t) => html`
                    <button
                      class="notifications-compose-type ${this.type === t.id ? "active" : ""}"
                      @click=${() => this.handleTypeChange(t.id)}
                    >
                      <uix-icon name=${t.icon} size="sm"></uix-icon>
                      <span>${t.label}</span>
                    </button>
                  `,
                )}
              </div>
            </div>

            <!-- Title -->
            <div class="notifications-compose-field">
              <label class="notifications-compose-label" for="title">Title *</label>
              <input
                id="title"
                type="text"
                class="notifications-compose-input"
                placeholder="Enter notification title..."
                .value=${this.title}
                @input=${this.handleTitleChange}
              />
            </div>

            <!-- Message -->
            <div class="notifications-compose-field">
              <label class="notifications-compose-label" for="message">Message *</label>
              <textarea
                id="message"
                class="notifications-compose-textarea"
                placeholder="Enter notification message..."
                rows="4"
                .value=${this.message}
                @input=${this.handleMessageChange}
              ></textarea>
            </div>

            <!-- Target -->
            <div class="notifications-compose-field">
              <label class="notifications-compose-label">Recipients</label>
              <div class="notifications-compose-targets">
                <label class="notifications-compose-target">
                  <input
                    type="radio"
                    name="target"
                    value="all"
                    ?checked=${this.targetType === "all"}
                    @change=${this.handleTargetChange}
                  />
                  <span>All Users (${this.users.length})</span>
                </label>
                <label class="notifications-compose-target">
                  <input
                    type="radio"
                    name="target"
                    value="specific"
                    ?checked=${this.targetType === "specific"}
                    @change=${this.handleTargetChange}
                  />
                  <span>Select Specific Users</span>
                </label>
              </div>
            </div>

            <!-- User Selection -->
            ${this.targetType === "specific"
              ? html`
                  <div class="notifications-compose-field">
                    <label class="notifications-compose-label">
                      Select Users (${this.selectedUsers.length} selected)
                    </label>
                    <div class="notifications-compose-users">
                      ${this.users.map(
                        (user) => html`
                          <label
                            class="notifications-compose-user ${this.selectedUsers.includes(user.id) ? "selected" : ""}"
                          >
                            <input
                              type="checkbox"
                              ?checked=${this.selectedUsers.includes(user.id)}
                              @change=${() => this.handleUserSelect(user.id)}
                            />
                            <span class="notifications-compose-user-name">${user.name || user.email}</span>
                            ${user.email ? html`<span class="notifications-compose-user-email">${user.email}</span>` : nothing}
                          </label>
                        `,
                      )}
                    </div>
                  </div>
                `
              : nothing}

            <!-- Content Link (Optional) -->
            <div class="notifications-compose-section">
              <h3 class="notifications-compose-section-title">Link to Content (Optional)</h3>
              <div class="notifications-compose-row">
                <div class="notifications-compose-field">
                  <label class="notifications-compose-label" for="contentType">Content Type</label>
                  <select
                    id="contentType"
                    class="notifications-compose-select"
                    .value=${this.contentType}
                    @change=${this.handleContentTypeChange}
                  >
                    <option value="">None</option>
                    <option value="place">Place</option>
                    <option value="event">Event</option>
                    <option value="meetup">Meetup</option>
                    <option value="group">Group</option>
                    <option value="guide">Guide</option>
                  </select>
                </div>
                <div class="notifications-compose-field">
                  <label class="notifications-compose-label" for="contentSlug">Content Slug</label>
                  <input
                    id="contentSlug"
                    type="text"
                    class="notifications-compose-input"
                    placeholder="e.g., copacabana-beach"
                    .value=${this.contentSlug}
                    @input=${this.handleContentSlugChange}
                    ?disabled=${!this.contentType}
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Preview -->
          <div class="notifications-compose-preview">
            <h3 class="notifications-compose-preview-title">Preview</h3>
            <div class="notifications-compose-preview-card">
              ${this.title || this.message
                ? html`
                    <notifications-item
                      .notification=${{
                        type: this.type,
                        title: this.title || "Notification Title",
                        message: this.message || "Notification message will appear here",
                        read: false,
                        createdAt: new Date().toISOString(),
                      }}
                    ></notifications-item>
                  `
                : html`
                    <div class="notifications-compose-preview-empty">
                      Start typing to see a preview
                    </div>
                  `}
            </div>

            <div class="notifications-compose-summary">
              <div class="notifications-compose-summary-item">
                <span class="notifications-compose-summary-label">Recipients</span>
                <span class="notifications-compose-summary-value">${recipientCount} users</span>
              </div>
              <div class="notifications-compose-summary-item">
                <span class="notifications-compose-summary-label">Type</span>
                <span class="notifications-compose-summary-value">${this.type}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="notifications-compose-actions">
          <uix-button variant="ghost" @click=${() => this.handleCancel()} ?disabled=${this.sending}>
            Cancel
          </uix-button>
          <uix-button
            variant="primary"
            @click=${() => this.handleSend()}
            ?disabled=${!this.isValid() || this.sending}
          >
            ${this.sending
              ? html`<uix-spinner size="sm"></uix-spinner> Sending...`
              : html`<uix-icon name="send" size="sm"></uix-icon> Send Notification`}
          </uix-button>
        </div>
      </div>
    `;
  },
};
