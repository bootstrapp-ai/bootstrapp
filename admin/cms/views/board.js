import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";
import Model from "/node_modules/@bootstrapp/model/index.js";

const getModelName = (name) => {
  if (!name) return name;
  if (name.endsWith("ies")) return `${name.slice(0, -3)}y`;
  if (name.endsWith("es")) return name.slice(0, -2);
  if (name.endsWith("s")) return name.slice(0, -1);
  return name;
};

import $APP from "/node_modules/@bootstrapp/base/app.js";
export default {
  tag: "cms-board",
  dataQuery: true,
  class: "flex flex-1 flex-col w-full",
  properties: {
    rows: T.array(),
    _data: T.object(),
    boardField: T.string({ defaultValue: "boardId" }),
    boardModel: T.string(),
    boards: T.object({ defaultValue: {} }),
    minimizedBoards: T.array({
      sync: "local",
      scope: "_data.model",
      defaultValue: [],
    }),
  },

  async getBoards() {
    console.log("GET BOARDS");
    const { models } = $APP;
    const modelProps = models[this["data-query"].model];

    if (!this.boardModel) {
      const relationshipProp = Object.entries(modelProps).find(
        ([, prop]) => prop.relationship,
      );
      this.boardModel = relationshipProp?.[1]?.targetModel;
    }
    console.log(this.boardModel, models[this.boardModel]);
    if (!this.boardModel || !Model[this.boardModel]) return;

    const coll = await Model[this.boardModel].getAll();
    this.boards = Object.fromEntries([
      ["", "No Board"],
      ...coll.map((item) => [item.id, item.name]),
    ]);
  },

  async saveBoardName(boardId, newName) {
    await Model[this.boardModel].edit({ id: boardId, name: newName });
    this.boards[boardId] = newName;
  },

  addTaskToBoard(boardId) {
    const boardRelField =
      this.boardField ??
      (this.boardModel
        ? `${getModelName(this.boardModel.toLowerCase())}Id`
        : "boardId");
    this.dispatchEvent(
      new CustomEvent("new-item", {
        detail: { id: undefined, [boardRelField]: boardId },
      }),
    );
  },

  async deleteBoard(boardId) {
    if (
      !confirm(
        "Are you sure you want to delete this board? All tasks will be moved to 'No Board'.",
      )
    ) {
      return;
    }
    const boardRelField =
      (this.boardField ?? this.boardModel)
        ? `${getModelName(this.boardModel.toLowerCase())}Id`
        : "boardId";
    const tasksToMove = this.rows.filter(
      (row) => row[boardRelField] === boardId,
    );

    const updatePromises = tasksToMove.map((task) =>
      Model[this["data-query"].model].update(task.id, {
        [boardRelField]: null,
      }),
    );
    await Promise.all(updatePromises);
    await Model[this.boardModel].remove(boardId);
    await this.getBoards();
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

  selectCard(item) {
    this.dispatchEvent(new CustomEvent("select-item", { detail: item }));
  },

  async willUpdate(changedProps) {
    if (changedProps.has("boardModel")) this.getBoards();
  },

  connected() {
    this.getBoards();
  },

  render() {
    const rows = this.rows;
    if (!rows) return null;
    const boardRelField =
      (this.boardField ?? this.boardModel)
        ? `${getModelName(this.boardModel.toLowerCase())}Id`
        : "boardId";
    console.log(this.boards);
    const visibleBoards = Object.entries(this.boards).filter(
      ([id]) => !this.minimizedBoards.includes(id),
    );
    const minimized = Object.entries(this.boards).filter(([id]) =>
      this.minimizedBoards.includes(id),
    );
    console.log({ visibleBoards });
    return html`
			<div class="flex h-full gap-8 basis-full overflow-x-auto p-4">
				${visibleBoards.map(
          ([boardId, boardName]) => html`
						<div class="flex flex-col w-72 flex-shrink-0 gap-4">
							<div
								class="group flex items-center justify-between p-2 rounded"
							>
								${
                  boardId
                    ? html`
											<uix-editable
												value=${boardName}
												.onSave=${(newName) =>
                          this.saveBoardName(boardId, newName)}
											>
											</uix-editable>
									  `
                    : html`
											<span class="text-lg font-bold uppercase"
												>${boardName}</span
											>
									  `
                }

								<div
									class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
								>
									${
                    boardId
                      ? html`
												<uix-button
													icon="plus"
													class="is-sm"
													title="Add Task"
													@click=${() => this.addTaskToBoard(boardId)}
												></uix-button>
												<uix-button
													icon="minus"
													class="is-sm"
													title="Minimize"
													@click=${() => this.toggleMinimizeBoard(boardId)}
												></uix-button>
												<uix-button
													icon="trash"
													class="is-sm is-danger"
													title="Delete Board"
													@click=${() => this.deleteBoard(boardId)}
												></uix-button>
										  `
                      : ""
                  }
								</div>
							</div>

							<uix-droparea
								class="flex flex-col basis-full p-2 gap-4 min-h-[200px]"
								droparea-id=${boardId}
								droparea-model="boards"
								droparea-related=""
							>
								${rows
                  .filter((item) => (item[boardRelField] || "") === boardId)
                  .map(
                    (item) => html`
											<uix-draggable
												dragged-id=${item.id}
												row=${item}
												.data-query=${{
                          model: this["data-query"].model,
                          key: "row",
                          id: item.id,
                        }}
												@click=${() => this.selectCard(item)}
												target=${boardRelField}
											>
												<uix-card
													class="p-2 border rounded shadow-sm w-full cursor-pointer"
												>
													<span class="text-base"
														>${item.title || item.name}</span
													>
												</uix-card>
											</uix-draggable>
										`,
                  )}
							</uix-droparea>
						</div>
					`,
        )}
				${
          minimized.length > 0
            ? html`
							<div class="flex flex-col w-64 flex-shrink-0 gap-2 p-2">
								<span class="text-lg font-bold uppercase mb-2"
									>Minimized</span
								>
								${minimized.map(
                  ([boardId, boardName]) => html`
										<div
											class="flex items-center justify-between p-2 rounded bg-gray-100"
										>
											<span class="font-semibold">${boardName}</span>
											<uix-button
												icon="plus"
												class="is-sm"
												label="Expand"
												@click=${() => this.toggleMinimizeBoard(boardId)}
											></uix-button>
										</div>
									`,
                )}
							</div>
					  `
            : ""
        }
			</div>
		`;
  },
};
