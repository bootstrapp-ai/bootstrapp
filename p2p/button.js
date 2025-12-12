import $APP from "/node_modules/@bootstrapp/base/app.js";
import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";
import Trystero from "trystero";
import Controller from "/node_modules/@bootstrapp/controller/index.js";

const eventHandlers = {
  SYNC_DATA_OP: ({ payload }) => {
    console.log({ payload });
    Controller.backend("P2P:LOAD_DATA_OP", payload);
  },
  REQUEST_TO_JOIN: ({ payload, peerId, component }) => {
    const { deviceId } = payload;
    console.log(
      `Received join request from peer ${peerId} with device ID ${deviceId}`,
    );

    const isKnownDevice = component.currentApp?.connections?.some(
      (conn) => conn.deviceId === deviceId,
    );

    if (isKnownDevice) {
      console.log(`Auto-approving known device: ${deviceId}`);
      component.projectRoom.sendEvent({ type: "RECONNECT_APPROVED" }, peerId);
    } else {
      console.log(
        `Device ${deviceId} is not trusted. Awaiting manual approval.`,
      );
      if (component.connectionRequests.some((req) => req.peerId === peerId))
        return;
      component.connectionRequests = [
        ...component.connectionRequests,
        { peerId, deviceId },
      ];
    }
  },
  JOIN_APPROVED: async ({ payload, peerId }) => {
    console.log(`Join request approved by ${peerId}. Receiving DB dump.`);
    await Controller.backend("P2P:JOIN_APP", payload);
    window.location.reload();
  },
  RECONNECT_APPROVED: ({ peerId }) => {
    console.log(`Reconnection approved by ${peerId}.`);
    alert("Reconnected to project successfully!");
  },
  JOIN_DENIED: ({ peerId, component }) => {
    console.log(`Join request denied by ${peerId}.`);
    alert("Your request to join the project was denied. Leaving room.");
    component.projectRoom?.room.leave();
    component.projectRoom = null;
  },
  DATA_OPERATION: ({ payload, peerId }) => {
    console.log(`Received DATA_OPERATION from peer ${peerId}:`, payload);
  },
};

export default {
  tag: "p2p-button",

  properties: {
    apps: T.array({ defaultValue: [] }),
    currentApp: T.object({ defaultValue: null }),
    projectRoom: T.object(),
    peerCount: T.number({ defaultValue: 0 }),
    connectionRequests: T.array({ defaultValue: [], sync: "local" }),
    joinAppId: T.string({ defaultValue: "" }),
    isLoading: T.boolean({ defaultValue: true }),
  },

  async firstUpdated() {
    this.isLoading = true;
    [this.apps, this.currentApp] = await Promise.all([
      Controller.backend("LIST_APPS"),
      Controller.backend("GET_CURRENT_APP"),
    ]);
    this.isLoading = false;

    if (this.currentApp?.id && Trystero) {
      this._joinRoom(this.currentApp.id, true);
    }
  },

  _joinRoom(appId, isMember = false) {
    if (!appId || !Trystero) return;
    console.log("JOIN ROOM", appId);
    this.peerCount = 0;
    this.connectionRequests = [];

    const room = Trystero.joinRoom({ appId }, appId);
    const [sendEvent, onEvent] = room.makeAction("event");
    this.sendEvent = sendEvent;
    onEvent((event, peerId) => {
      const handler = eventHandlers[event.type];
      if (handler) {
        handler({ payload: event.payload, peerId, component: this });
      } else {
        console.warn(`No handler found for event type: ${event.type}`);
      }
    });

    room.onPeerJoin((peerId) => {
      this.peerCount = Object.keys(room.getPeers()).length;
      if (!isMember) {
        console.log(`Requesting to join room ${appId}...`);
        sendEvent({
          type: "REQUEST_TO_JOIN",
          payload: { deviceId: $APP.about.device.id },
        });
      }
    });

    room.onPeerLeave((peerId) => {
      this.peerCount = Object.keys(room.getPeers()).length;
      this.connectionRequests = this.connectionRequests.filter(
        (req) => req.peerId !== peerId,
      );
    });

    this.projectRoom = { room, sendEvent, appId };
  },

  async _handleApproveRequest(request) {
    console.log(
      `Approving request for peer ${request.peerId} with device ${request.deviceId}`,
    );

    await Controller.backend("P2P:REGISTER_PEER_CONNECTION", {
      appId: this.currentApp.id,
      deviceId: request.deviceId,
    });

    const dump = await Controller.backend("GET_DB_DUMP");
    this.projectRoom.sendEvent(
      { type: "JOIN_APPROVED", payload: { app: this.currentApp, db: dump } },
      request.peerId,
    );

    if (
      !this.currentApp.connections?.some((c) => c.deviceId === request.deviceId)
    ) {
      this.currentApp.connections = [
        ...(this.currentApp.connections || []),
        { deviceId: request.deviceId },
      ];
    }

    this.connectionRequests = this.connectionRequests.filter(
      (r) => r.peerId !== request.peerId,
    );
  },

  _handleDenyRequest(request) {
    console.log(`Denying request from ${request.peerId}`);
    this.projectRoom.sendEvent(
      { type: "JOIN_DENIED", payload: {} },
      request.peerId,
    );
    this.connectionRequests = this.connectionRequests.filter(
      (r) => r.peerId !== request.peerId,
    );
  },

  _handleJoinApp() {
    const appId = this.joinAppId;
    if (appId) {
      this._joinRoom(appId, false);
    }
  },

  async _handleSelectApp(appId) {
    if (appId && appId !== this.currentApp?.id) {
      await Controller.backend("SELECT_APP", { appId });
      window.location.reload();
    }
  },

  async _handleCreateApp() {
    await Controller.backend("CREATE_APP");
    window.location.reload();
  },

  _handleSendDataOperation() {
    if (!this.projectRoom || this.peerCount === 0) return;
    const samplePayload = {
      timestamp: Date.now(),
      operation: "CREATE_ITEM",
      data: {
        id: `item-${Math.random().toString(36).substr(2, 9)}`,
        value: "hello world",
      },
    };
    this.projectRoom.sendEvent({
      type: "DATA_OPERATION",
      payload: samplePayload,
    });
  },
  connected() {
    $APP.p2p.on("SEND_DATA_OP", (payload) => {
      if (this.sendEvent) this.sendEvent({ type: "SYNC_DATA_OP", payload });
    });
    Controller.backend("START_SYNC_DATA");
  },
  disconnected() {
    Controller.backend("STOP_SYNC_DATA");
  },
  render() {
    const isConnected = this.peerCount > 0;
    const statusText = isConnected
      ? `Connected to ${this.peerCount} peer(s)`
      : "Offline";

    return html`
        <uix-modal>
				<uix-button icon="wifi"></uix-button>
				<dialog>
					<div class="flex flex-col gap-4 p-4 w-[640px]">
						<p class="text-lg">Project ID: <strong class="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">#${this.currentApp?.id}</strong></p>
						<p class="text-sm text-gray-500 flex items-center gap-2">Status: ${statusText} <uix-icon name=${isConnected ? "users" : "cloud-off"}></uix-icon></p>
						
						${
              this.projectRoom
                ? html`
							<hr class="my-2 border-gray-200 dark:border-gray-700" />
							<h6 class="font-semibold">Test Data Sync</h6>
							<uix-button								
								label="Send Data Operation"
								icon="send"
								.click=${this._handleSendDataOperation.bind(this)}
								.disabled=${!isConnected}
								title=${!isConnected ? "Must be connected to another peer to send data" : "Send a sample data operation"}
							></uix-button>
						`
                : ""
            }
						${
              this.connectionRequests.length > 0
                ? html`
							<hr class="my-2 border-gray-200 dark:border-gray-700" />
							<h6 class="font-semibold">Connection Requests</h6>
							<div class="flex flex-col gap-2">
								${this.connectionRequests.map(
                  (req) => html`
									<div class="p-2 bg-gray-100 dark:bg-gray-800 rounded-md flex flex-col gap-2">
										<p>Request from: <strong class="font-mono">${req.peerId.slice(0, 8)}...</strong></p>
										<div class="flex justify-end gap-2">
											<uix-button @click=${() => this._handleDenyRequest(req)} label="Deny"></uix-button>
											<uix-button @click=${() => this._handleApproveRequest(req)} label="Approve"></uix-button>
										</div>
									</div>
								`,
                )}
							</div>
						`
                : ""
            }

						<hr class="my-2 border-gray-200 dark:border-gray-700" />
						<h6 class="font-semibold">My Projects</h6>
						${
              this.isLoading
                ? html`<uix-spinner></uix-spinner>`
                : html`
							<div class="flex flex-col gap-2">
								${this.apps.map(
                  (app) => html`
									<uix-button										
										@click=${() => this._handleSelectApp(app.id)}
										label=${`Project ${app.id.slice(0, 12)}...`}
									></uix-button>
								`,
                )}
							</div>
						`
            }

						<hr class="my-2 border-gray-200 dark:border-gray-700" />
						<h6 class="font-semibold">Join a Project</h6>
						<uix-join class="flex">
							<uix-input								
								label="Enter Project ID to join"
								.bind=${this.prop("joinAppId")}            
							></uix-input>
							<uix-button								
								@click=${this._handleJoinApp.bind(this)}
								label="Join"
								icon="log-in"
								.disabled=${!this.joinAppId}
							></uix-button>
						</uix-join>

						<hr class="my-2 border-gray-200 dark:border-gray-700" />
						<uix-button @click=${this._handleCreateApp} label="Create New Project" icon="plus"></uix-button>
					</div>
				</dialog>
			</uix-modal>
    `;
  },
};
