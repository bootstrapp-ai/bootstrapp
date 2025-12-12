import T from "/$app/types/index.js";
import $APP from "/$app.js";
import { html } from "/npm/lit-html";

export default {
  tag: "admin-board",
  class: "flex flex-1 flex-col w-full",
  properties: {
    rows: T.array(),
    model: T.string(),
    groupByField: T.string({
      sync: "local",
      scope: "model",
      defaultValue: "",
    }),
    boards: T.object({
      sync: "local",
      scope: "model",
      defaultValue: {},
    }),
    minimizedBoards: T.array({
      sync: "local",
      scope: "model",
      defaultValue: [],
    }),
    showAddBoard: T.boolean({ defaultValue: false }),
    newBoardName: T.string({ defaultValue: "" }),
  },

  generateBoards() {
    if (!this.groupByField || !this.rows?.length) {
      // No grouping - single column
      if (Object.keys(this.boards).length === 0) {
        this.boards = { "": "All Items" };
      }
      return;
    }

    // Get unique values from the selected field
    const uniqueValues = [
      ...new Set(this.rows.map((r) => r[this.groupByField]).filter((v) => v != null)),
    ];

    // Merge with existing boards (keep custom boards)
    const existingKeys = Object.keys(this.boards);
    const newBoards = { "": "No Value" };

    // Add boards from data values
    for (const value of uniqueValues) {
      const key = String(value);
      newBoards[key] = this.boards[key] || key;
    }

    // Keep any custom boards that aren't in data
    for (const [key, name] of Object.entries(this.boards)) {
      if (key && !newBoards[key]) {
        newBoards[key] = name;
      }
    }

    this.boards = newBoards;
  },

  addBoard() {
    const name = this.newBoardName.trim();
    if (!name) return;

    // Generate a unique key
    const key = name.toLowerCase().replace(/\s+/g, "-");
    this.boards = { ...this.boards, [key]: name };
    this.newBoardName = "";
    this.showAddBoard = false;
  },

  renameBoard(boardId, newName) {
    if (!boardId) return; // Can't rename "No Value" board
    this.boards = { ...this.boards, [boardId]: newName };
  },

  deleteBoard(boardId) {
    if (!boardId) return; // Can't delete "No Value" board
    if (!confirm(`Delete board "${this.boards[boardId]}"? Items will move to "No Value".`)) {
      return;
    }

    const { [boardId]: _, ...rest } = this.boards;
    this.boards = rest;

    // Update items in this board to have no value
    if (this.groupByField) {
      this.rows
        .filter((r) => String(r[this.groupByField]) === boardId)
        .forEach((r) => {
          $APP.Model[this.model].edit({ id: r.id, [this.groupByField]: null });
        });
    }
  },

  toggleMinimizeBoard(boardId) {
    const index = this.minimizedBoards.indexOf(boardId);
    if (index === -1) {
      this.minimizedBoards = [...this.minimizedBoards, boardId];
    } else {
      const updated = [...this.minimizedBoards];
      updated.splice(index, 1);
      this.minimizedBoards = updated;
    }
  },

  addItemToBoard(boardId) {
    const initialData = this.groupByField ? { [this.groupByField]: boardId || null } : {};
    this.emit("new-item", initialData);
  },

  selectCard(item) {
    this.emit("select-item", item);
  },

  getItemBoardKey(item) {
    if (!this.groupByField) return "";
    const value = item[this.groupByField];
    return value != null ? String(value) : "";
  },

  willUpdate({ changedProps }) {
    if (changedProps.has("rows") || changedProps.has("groupByField")) {
      this.generateBoards();
    }
  },

  connected() {
    this.generateBoards();
  },

  render() {
    const { rows, boards, minimizedBoards } = this;
    if (!rows) return null;

    const visibleBoards = Object.entries(boards).filter(
      ([id]) => !minimizedBoards.includes(id),
    );
    const minimized = Object.entries(boards).filter(([id]) =>
      minimizedBoards.includes(id),
    );

    return html`
      <div class="flex h-full gap-6 overflow-x-auto p-4">
        ${visibleBoards.map(
          ([boardId, boardName]) => html`
            <div class="flex flex-col w-72 flex-shrink-0 gap-4">
              <!-- Board Header -->
              <div
                class="group flex items-center justify-between p-3 bg-white border-3 border-black rounded-xl"
              >
                ${boardId
                  ? html`
                      <uix-editable
                        value=${boardName}
                        .onSave=${(newName) => this.renameBoard(boardId, newName)}
                        class="font-bold text-lg"
                      ></uix-editable>
                    `
                  : html`
                      <span class="font-black text-lg uppercase">${boardName}</span>
                    `}

                <div
                  class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    @click=${() => this.addItemToBoard(boardId)}
                    class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Add item"
                  >
                    <uix-icon name="plus" size="16"></uix-icon>
                  </button>
                  ${boardId
                    ? html`
                        <button
                          @click=${() => this.toggleMinimizeBoard(boardId)}
                          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Minimize"
                        >
                          <uix-icon name="minus" size="16"></uix-icon>
                        </button>
                        <button
                          @click=${() => this.deleteBoard(boardId)}
                          class="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          title="Delete board"
                        >
                          <uix-icon name="trash" size="16"></uix-icon>
                        </button>
                      `
                    : ""}
                </div>
              </div>

              <!-- Board Cards -->
              <div
                class="flex flex-col flex-1 p-3 gap-3 min-h-[200px] bg-gray-100 border-3 border-black border-dashed rounded-xl"
              >
                ${rows
                  .filter((item) => this.getItemBoardKey(item) === boardId)
                  .map(
                    (item) => html`
                      <div
                        @click=${() => this.selectCard(item)}
                        class="p-4 bg-white border-3 border-black rounded-xl cursor-pointer
                               shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                               hover:translate-x-[1px] hover:translate-y-[1px]
                               hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                               transition-all duration-150"
                      >
                        <span class="font-medium">
                          ${item.title || item.name || `#${item.id}`}
                        </span>
                      </div>
                    `,
                  )}
              </div>
            </div>
          `,
        )}

        <!-- Add Board Column -->
        <div class="flex flex-col w-72 flex-shrink-0 gap-4">
          ${this.showAddBoard
            ? html`
                <div class="p-3 bg-white border-3 border-black rounded-xl">
                  <input
                    type="text"
                    placeholder="Board name..."
                    .value=${this.newBoardName}
                    @input=${(e) => (this.newBoardName = e.target.value)}
                    @keydown=${(e) => {
                      if (e.key === "Enter") this.addBoard();
                      if (e.key === "Escape") this.showAddBoard = false;
                    }}
                    class="w-full px-3 py-2 border-2 border-black rounded-lg mb-2"
                    autofocus
                  />
                  <div class="flex gap-2">
                    <button
                      @click=${this.addBoard}
                      class="flex-1 px-3 py-2 bg-black text-white font-bold rounded-lg"
                    >
                      Add
                    </button>
                    <button
                      @click=${() => (this.showAddBoard = false)}
                      class="px-3 py-2 border-2 border-black rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              `
            : html`
                <button
                  @click=${() => (this.showAddBoard = true)}
                  class="flex items-center justify-center gap-2 p-4 border-3 border-black border-dashed
                         rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-colors"
                >
                  <uix-icon name="plus" size="20"></uix-icon>
                  <span class="font-bold">Add Board</span>
                </button>
              `}
        </div>

        <!-- Minimized Boards -->
        ${minimized.length > 0
          ? html`
              <div class="flex flex-col w-48 flex-shrink-0 gap-3 p-3">
                <span class="font-black text-sm uppercase text-gray-500">
                  Minimized
                </span>
                ${minimized.map(
                  ([boardId, boardName]) => html`
                    <button
                      @click=${() => this.toggleMinimizeBoard(boardId)}
                      class="flex items-center justify-between p-3 bg-gray-200 border-2 border-black
                             rounded-lg hover:bg-gray-300 transition-colors text-left"
                    >
                      <span class="font-medium text-sm">${boardName}</span>
                      <uix-icon name="maximize-2" size="14"></uix-icon>
                    </button>
                  `,
                )}
              </div>
            `
          : ""}
      </div>
    `;
  },
};
