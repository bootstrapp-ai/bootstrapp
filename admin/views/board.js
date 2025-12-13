import T from "/$app/types/index.js";
import $APP from "/$app.js";
import { html } from "/npm/lit-html";

export default {
  tag: "admin-board",
  style: true,
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
      if (Object.keys(this.boards).length === 0) {
        this.boards = { "": "All Items" };
      }
      return;
    }

    const uniqueValues = [
      ...new Set(this.rows.map((r) => r[this.groupByField]).filter((v) => v != null)),
    ];

    const newBoards = { "": "No Value" };

    for (const value of uniqueValues) {
      const key = String(value);
      newBoards[key] = this.boards[key] || key;
    }

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

    const key = name.toLowerCase().replace(/\s+/g, "-");
    this.boards = { ...this.boards, [key]: name };
    this.newBoardName = "";
    this.showAddBoard = false;
  },

  renameBoard(boardId, newName) {
    if (!boardId) return;
    this.boards = { ...this.boards, [boardId]: newName };
  },

  deleteBoard(boardId) {
    if (!boardId) return;
    if (!confirm(`Delete board "${this.boards[boardId]}"? Items will move to "No Value".`)) {
      return;
    }

    const { [boardId]: _, ...rest } = this.boards;
    this.boards = rest;

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

  async handleDrop(e, boardId) {
    const draggedId = e.dataTransfer?.getData("text/plain");
    if (!draggedId || !this.groupByField) return;

    const newValue = boardId || null;
    await $APP.Model[this.model].edit({
      id: draggedId,
      [this.groupByField]: newValue,
    });
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
      <div class="admin-board">
        ${visibleBoards.map(
          ([boardId, boardName]) => html`
            <div class="admin-board-lane">
              <div class="admin-board-header">
                ${boardId
                  ? html`
                      <uix-editable
                        value=${boardName}
                        .onSave=${(newName) => this.renameBoard(boardId, newName)}
                        class="admin-board-title"
                      ></uix-editable>
                    `
                  : html`<span class="admin-board-title-fixed">${boardName}</span>`}

                <div class="admin-board-actions">
                  <uix-button
                    ghost
                    size="sm"
                    @click=${() => this.addItemToBoard(boardId)}
                    title="Add item"
                  >
                    <uix-icon name="plus" size="16"></uix-icon>
                  </uix-button>
                  ${boardId
                    ? html`
                        <uix-button
                          ghost
                          size="sm"
                          @click=${() => this.toggleMinimizeBoard(boardId)}
                          title="Minimize"
                        >
                          <uix-icon name="minus" size="16"></uix-icon>
                        </uix-button>
                        <uix-button
                          ghost
                          size="sm"
                          danger
                          @click=${() => this.deleteBoard(boardId)}
                          title="Delete board"
                        >
                          <uix-icon name="trash" size="16"></uix-icon>
                        </uix-button>
                      `
                    : ""}
                </div>
              </div>

              <uix-droparea
                droparea-id=${boardId}
                class="admin-board-column"
                .ondrop=${(e) => this.handleDrop(e, boardId)}
              >
                ${rows
                  .filter((item) => this.getItemBoardKey(item) === boardId)
                  .map(
                    (item) => html`
                      <uix-draggable
                        dragged-id=${item.id}
                        target=${this.groupByField}
                        .data-query=${{ model: this.model }}
                      >
                        <uix-card
                          class="admin-board-card"
                          @click=${() => this.selectCard(item)}
                          hover
                        >
                          <span class="admin-board-card-title">
                            ${item.title || item.name || `#${item.id}`}
                          </span>
                        </uix-card>
                      </uix-draggable>
                    `,
                  )}
              </uix-droparea>
            </div>
          `,
        )}

        <div class="admin-board-lane admin-board-add">
          ${this.showAddBoard
            ? html`
                <uix-card class="admin-board-add-form">
                  <uix-input
                    placeholder="Board name..."
                    .value=${this.newBoardName}
                    @input=${(e) => (this.newBoardName = e.target.value)}
                    @keydown=${(e) => {
                      if (e.key === "Enter") this.addBoard();
                      if (e.key === "Escape") this.showAddBoard = false;
                    }}
                    autofocus
                  ></uix-input>
                  <div class="admin-board-add-actions">
                    <uix-button @click=${this.addBoard}>Add</uix-button>
                    <uix-button ghost @click=${() => (this.showAddBoard = false)}>
                      Cancel
                    </uix-button>
                  </div>
                </uix-card>
              `
            : html`
                <uix-button
                  ghost
                  class="admin-board-add-btn"
                  @click=${() => (this.showAddBoard = true)}
                >
                  <uix-icon name="plus" size="20"></uix-icon>
                  <span>Add Board</span>
                </uix-button>
              `}
        </div>

        ${minimized.length > 0
          ? html`
              <div class="admin-board-minimized">
                <span class="admin-board-minimized-label">Minimized</span>
                ${minimized.map(
                  ([boardId, boardName]) => html`
                    <uix-button
                      ghost
                      size="sm"
                      @click=${() => this.toggleMinimizeBoard(boardId)}
                      class="admin-board-minimized-item"
                    >
                      <span>${boardName}</span>
                      <uix-icon name="maximize-2" size="14"></uix-icon>
                    </uix-button>
                  `,
                )}
              </div>
            `
          : ""}
      </div>
    `;
  },
};
