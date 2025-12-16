/**
 * @bootstrapp/cms - Publishing Bar
 * Status bar for content publishing workflow
 */

import T from "/$app/types/index.js";
import $APP from "/$app.js";
import { html } from "/npm/lit-html";

$APP.define("cms-publishing-bar", {
  tag: "cms-publishing-bar",
  style: true,
  properties: {
    status: T.string({ defaultValue: "draft" }),
    publishedAt: T.string(),
    scheduledAt: T.string(),
    showScheduler: T.boolean({ defaultValue: false }),
  },

  handleStatusChange(newStatus) {
    if (newStatus === "scheduled") {
      this.showScheduler = true;
    } else {
      this.status = newStatus;
      this.emit("status-change", newStatus);
    }
  },

  handleScheduleConfirm() {
    const input = this.querySelector('input[type="datetime-local"]');
    if (input && input.value) {
      this.scheduledAt = new Date(input.value).toISOString();
      this.status = "scheduled";
      this.showScheduler = false;
      this.emit("status-change", "scheduled");
      this.emit("schedule-change", this.scheduledAt);
    }
  },

  formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  render() {
    const statusConfig = {
      draft: {
        bg: "bg-gray-100",
        border: "border-gray-400",
        text: "text-gray-700",
        icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
        label: "Draft",
      },
      published: {
        bg: "bg-green-100",
        border: "border-green-500",
        text: "text-green-700",
        icon: "M5 13l4 4L19 7",
        label: "Published",
      },
      scheduled: {
        bg: "bg-yellow-100",
        border: "border-yellow-500",
        text: "text-yellow-700",
        icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        label: "Scheduled",
      },
    };

    const config = statusConfig[this.status] || statusConfig.draft;

    return html`
      <div class="cms-publishing-bar">
        <div
          class="flex items-center gap-4 p-4 ${config.bg} border-2 ${config.border} rounded-lg"
        >
          <!-- Status Icon and Label -->
          <div class="flex items-center gap-2 ${config.text}">
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="${config.icon}"
              />
            </svg>
            <span class="font-black uppercase">${config.label}</span>
          </div>

          <!-- Status Info -->
          ${this.status === "published" && this.publishedAt
            ? html`
                <div class="text-sm ${config.text}">
                  Published on ${this.formatDate(this.publishedAt)}
                </div>
              `
            : null}
          ${this.status === "scheduled" && this.scheduledAt
            ? html`
                <div class="text-sm ${config.text}">
                  Scheduled for ${this.formatDate(this.scheduledAt)}
                </div>
              `
            : null}

          <div class="flex-1"></div>

          <!-- Status Dropdown -->
          <select
            .value=${this.status}
            @change=${(e) => this.handleStatusChange(e.target.value)}
            class="px-3 py-2 border-2 border-black rounded-lg font-bold text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none cursor-pointer"
          >
            <option value="draft">Save as Draft</option>
            <option value="published">Publish Now</option>
            <option value="scheduled">Schedule...</option>
          </select>
        </div>

        <!-- Schedule Modal -->
        ${this.showScheduler
          ? html`
              <div
                class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                @click=${(e) => {
                  if (e.target === e.currentTarget) this.showScheduler = false;
                }}
              >
                <div
                  class="bg-white border-3 border-black rounded-xl p-6 w-full max-w-md shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  <h3 class="text-lg font-black uppercase mb-4">
                    Schedule Publication
                  </h3>

                  <div class="mb-4">
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                      Publish Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      .value=${this.scheduledAt
                        ? new Date(this.scheduledAt).toISOString().slice(0, 16)
                        : ""}
                      min=${new Date().toISOString().slice(0, 16)}
                      class="w-full p-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                  </div>

                  <div class="flex gap-3">
                    <button
                      type="button"
                      @click=${() => (this.showScheduler = false)}
                      class="flex-1 py-2 border-2 border-black rounded-lg font-bold hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      @click=${() => this.handleScheduleConfirm()}
                      class="flex-1 py-2 bg-yellow-400 border-2 border-black rounded-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              </div>
            `
          : null}
      </div>
    `;
  },
});
