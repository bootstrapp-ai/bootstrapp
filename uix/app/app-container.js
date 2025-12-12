import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";
import { getCurrentBreakpoint, useBreakpoint } from "../utils/breakpoints.js";

export default {
  tag: "uix-app-container",
  properties: {
    layout: T.string({
      defaultValue: "auto",
      enum: ["auto", "mobile", "desktop"],
    }),

    // Mobile-specific: Safe Area
    useSafeArea: T.boolean(true),

    // Desktop-specific: Multi-pane
    multiPane: T.boolean(false),

    // Routing (shared)
    currentRoute: T.string("/"),
    routes: T.object({}),

    // Height control
    height: T.string({ defaultValue: "100vh" }),
  },
  style: true,
  shadow: true,

  connected() {
    // Initialize breakpoint detection
    this.currentBreakpoint = getCurrentBreakpoint();
    this.isMobile = ["xs", "sm"].includes(this.currentBreakpoint);

    // Set up breakpoint listener for auto-switching
    this.breakpointCleanup = useBreakpoint((bp) => {
      if (this.layout === "auto") {
        const wasMobile = this.isMobile;
        this.isMobile = ["xs", "sm"].includes(bp);

        // Emit layout change event when switching
        if (wasMobile !== this.isMobile) {
          this.emit("layout-change", {
            layout: this.isMobile ? "mobile" : "desktop",
            breakpoint: bp,
          });
        }

        this.requestUpdate();
      }
    });

    // Listen to browser history changes
    this._popStateHandler = (e) => {
      if (e.state?.path) {
        const oldRoute = this.currentRoute;
        this.currentRoute = e.state.path;
        this.emit("route-change", {
          from: oldRoute,
          to: e.state.path,
          params: e.state.params || {},
        });
      }
    };
    window.addEventListener("popstate", this._popStateHandler);
  },

  disconnected() {
    // Cleanup breakpoint listener
    this.breakpointCleanup?.cleanup();

    // Cleanup history listener
    if (this._popStateHandler) {
      window.removeEventListener("popstate", this._popStateHandler);
    }
  },

  updated({ changedProps }) {
    // Sync height property to CSS variable for flexibility
    if (changedProps.has("height")) {
      this.style.setProperty("--app-container-height", this.height);
    }
  },

  // Navigation methods
  navigate(path, params = {}) {
    const oldRoute = this.currentRoute;
    this.currentRoute = path;

    // Update browser history
    const url = new URL(path, window.location.origin);
    Object.entries(params).forEach(([k, v]) => {
      url.searchParams.set(k, v);
    });

    window.history.pushState({ path, params }, "", url);

    // Emit navigation events
    this.emit("navigate", { path, params });
    this.emit("route-change", { from: oldRoute, to: path, params });

    // Scroll to top
    this.scrollToTop();
  },

  goBack() {
    window.history.back();
  },

  scrollToTop() {
    const content = this.shadowRoot?.querySelector('[part="content"]');
    if (content) {
      content.scrollTo({ top: 0, behavior: "smooth" });
    }
  },

  // Render methods
  render() {
    const effectiveLayout =
      this.layout === "auto"
        ? this.isMobile
          ? "mobile"
          : "desktop"
        : this.layout;

    return effectiveLayout === "mobile"
      ? this.renderMobileLayout()
      : this.renderDesktopLayout();
  },

  renderMobileLayout() {
    return html`
      <div part="container" class="mobile-container">
        <div part="header" class="mobile-header">
          <slot name="header"></slot>
        </div>

        <main part="content" class="content">
          <slot></slot>
        </main>

        <div part="bottom-nav" class="mobile-bottom-nav">
          <slot name="bottom-nav"></slot>
        </div>

        <div part="floating-action" class="mobile-floating-action">
          <slot name="floating-action"></slot>
        </div>
      </div>
    `;
  },

  renderDesktopLayout() {
    return html`
      <div part="container" class="desktop-container">
        <div part="titlebar" class="desktop-titlebar">
          <slot name="titlebar"></slot>
        </div>

        <div part="body" class="desktop-body">
          <div part="sidebar" class="desktop-sidebar">
            <slot name="sidebar"></slot>
          </div>

          <div part="main" class="desktop-main">
            <div part="toolbar" class="desktop-toolbar">
              <slot name="toolbar"></slot>
            </div>

            <main part="content" class="content">
              <slot></slot>
            </main>
          </div>

          ${
            this.multiPane
              ? html`
                <div part="panel" class="secondary-panel">
                  <slot name="panel-secondary"></slot>
                </div>
              `
              : ""
          }
        </div>

        <div part="statusbar" class="status-bar">
          <slot name="status-bar"></slot>
        </div>
      </div>
    `;
  },
};

/**
 * App Container Component
 *
 * @component
 * @category layout
 * @tag uix-app-container
 *
 * A unified responsive app container that automatically switches between mobile
 * and desktop layouts based on viewport size. Includes routing, navigation,
 * and app chrome components.
 *
 * @slot default - Main content area (shared)
 * @slot header - Mobile: header component (e.g., uix-app-header)
 * @slot bottom-nav - Mobile: bottom navigation component
 * @slot floating-action - Mobile: floating action button
 * @slot titlebar - Desktop: title bar component (e.g., uix-title-bar)
 * @slot sidebar - Desktop: sidebar component (e.g., uix-sidebar)
 * @slot toolbar - Desktop: top toolbar/breadcrumbs
 * @slot panel-secondary - Desktop: secondary panel (multi-pane mode)
 * @slot status-bar - Desktop: bottom status bar
 *
 * @part container - The main container
 * @part header - Mobile: the header component
 * @part content - The main content area
 * @part bottom-nav - Mobile: the bottom navigation
 * @part titlebar - Desktop: the title bar
 * @part sidebar - Desktop: the sidebar
 * @part body - Desktop: the body container
 * @part main - Desktop: the main content area
 * @part toolbar - Desktop: the toolbar area
 * @part panel - Desktop: the secondary panel
 * @part statusbar - Desktop: the status bar
 *
 * @example Modern Payment App with Drawer (800px for viewer)
 * ```html
 * <uix-device device="iphone" height="800px">
 *   <uix-app-container layout="mobile">
 *     <!-- Header with user greeting -->
 *     <uix-app-header slot="header">
 *       <button slot="start" onclick="document.querySelector('#paymentDrawer').toggleDrawer()">
 *         <uix-icon name="menu"></uix-icon>
 *       </button>
 *       <uix-flex slot="title" align="center" gap="sm">
 *         <uix-avatar name="Chad Smith" size="sm" status="online"></uix-avatar>
 *         <uix-flex direction="column" gap="none">
 *           <uix-text size="xs" color="muted">Hello Chad,</uix-text>
 *           <uix-heading level="6">Welcome Back</uix-heading>
 *         </uix-flex>
 *       </uix-flex>
 *       <button slot="end"><uix-icon name="bell"></uix-icon></button>
 *     </uix-app-header>
 *
 *     <!-- Drawer navigation using uix-drawer -->
 *     <uix-drawer id="paymentDrawer">
 *       <div style="padding: var(--spacing-lg);">
 *         <div style="padding-bottom: var(--spacing-lg); border-bottom: 1px solid var(--color-border); margin-bottom: var(--spacing-lg);">
 *           <uix-flex align="center" gap="md">
 *             <uix-avatar name="Chad Smith" size="lg"></uix-avatar>
 *             <uix-flex direction="column" gap="none">
 *               <uix-heading level="5">Chad Smith</uix-heading>
 *               <uix-text size="sm" color="muted">chad@example.com</uix-text>
 *             </uix-flex>
 *           </uix-flex>
 *         </div>
 *         <nav style="display: flex; flex-direction: column; gap: 0.5rem;">
 *           <a href="/" style="display: flex; align-items: center; gap: var(--spacing-md);"><uix-icon name="house"></uix-icon>Home</a>
 *           <a href="/wallet" style="display: flex; align-items: center; gap: var(--spacing-md);"><uix-icon name="credit-card"></uix-icon>Wallet</a>
 *           <a href="/stats" style="display: flex; align-items: center; gap: var(--spacing-md);"><uix-icon name="chart-bar"></uix-icon>Statistics</a>
 *           <a href="/settings" style="display: flex; align-items: center; gap: var(--spacing-md);"><uix-icon name="settings"></uix-icon>Settings</a>
 *           <a href="/help" style="display: flex; align-items: center; gap: var(--spacing-md);"><uix-icon name="circle-help"></uix-icon>Help & Support</a>
 *         </nav>
 *       </div>
 *     </uix-drawer>
 *
 *   <!-- Main content with cards -->
 *   <uix-flex direction="column" gap="lg" style="padding: var(--spacing-lg);">
 *     <!-- Card Wallet Section -->
 *     <section>
 *       <uix-heading level="6" style="margin-bottom: var(--spacing-md)">My Cards</uix-heading>
 *       <uix-grid columns="2" gap="md">
 *         <uix-card shadow="md" style="--card-gradient-from: #667eea; --card-gradient-to: #764ba2; color: white; padding: var(--spacing-lg)">
 *           <uix-flex direction="column" justify="space-between" style="height: 150px">
 *             <uix-flex justify="space-between">
 *               <uix-icon name="credit-card" size="lg"></uix-icon>
 *               <uix-icon name="wifi" size="sm"></uix-icon>
 *             </uix-flex>
 *             <div>
 *               <uix-text size="xs" style="opacity: 0.8">Card Number</uix-text>
 *               <uix-text weight="semibold">•••• 5436</uix-text>
 *             </div>
 *           </uix-flex>
 *         </uix-card>
 *         <uix-card shadow="md" style="--card-gradient-from: #f093fb; --card-gradient-to: #f5576c; color: white; padding: var(--spacing-lg)">
 *           <uix-flex direction="column" justify="space-between" style="height: 150px">
 *             <uix-flex justify="space-between">
 *               <uix-icon name="credit-card" size="lg"></uix-icon>
 *               <uix-icon name="wifi" size="sm"></uix-icon>
 *             </uix-flex>
 *             <div>
 *               <uix-text size="xs" style="opacity: 0.8">Card Number</uix-text>
 *               <uix-text weight="semibold">•••• 8375</uix-text>
 *             </div>
 *           </uix-flex>
 *         </uix-card>
 *       </uix-grid>
 *     </section>
 *
 *     <!-- Quick Actions -->
 *     <section>
 *       <uix-flex gap="md" justify="space-around">
 *         <uix-flex direction="column" align="center" gap="xs">
 *           <button style="width: 60px; height: 60px; border-radius: 50%; background: var(--color-primary); border: none;">
 *             <uix-icon name="send" color="inverse" size="lg"></uix-icon>
 *           </button>
 *           <uix-text size="sm">Send</uix-text>
 *         </uix-flex>
 *         <uix-flex direction="column" align="center" gap="xs">
 *           <button style="width: 60px; height: 60px; border-radius: 50%; background: var(--color-success); border: none;">
 *             <uix-icon name="download" color="inverse" size="lg"></uix-icon>
 *           </button>
 *           <uix-text size="sm">Request</uix-text>
 *         </uix-flex>
 *         <uix-flex direction="column" align="center" gap="xs">
 *           <button style="width: 60px; height: 60px; border-radius: 50%; background: var(--color-warning); border: none;">
 *             <uix-icon name="file-text" color="inverse" size="lg"></uix-icon>
 *           </button>
 *           <uix-text size="sm">Bill</uix-text>
 *         </uix-flex>
 *         <uix-flex direction="column" align="center" gap="xs">
 *           <button style="width: 60px; height: 60px; border-radius: 50%; background: var(--color-surface); border: 1px solid var(--color-border);">
 *             <uix-icon name="ellipsis" size="lg"></uix-icon>
 *           </button>
 *           <uix-text size="sm">More</uix-text>
 *         </uix-flex>
 *       </uix-flex>
 *     </section>
 *
 *     <!-- Recent Contacts -->
 *     <section>
 *       <uix-flex justify="space-between" align="center" style="margin-bottom: var(--spacing-md)">
 *         <uix-heading level="6">Recent Contacts</uix-heading>
 *         <uix-text size="sm" color="primary">See All</uix-text>
 *       </uix-flex>
 *       <uix-flex gap="lg" style="overflow-x: auto; padding-bottom: var(--spacing-sm)">
 *         <uix-contact-avatar name="Jeff Wilson" size="md"></uix-contact-avatar>
 *         <uix-contact-avatar name="Clara Martinez" size="md"></uix-contact-avatar>
 *         <uix-contact-avatar name="Burak Yilmaz" size="md"></uix-contact-avatar>
 *         <uix-contact-avatar name="Sheila Brown" size="md"></uix-contact-avatar>
 *         <uix-flex direction="column" align="center" gap="xs" style="min-width: 60px">
 *           <button style="width: 40px; height: 40px; border-radius: 50%; background: var(--color-surface); border: 1px dashed var(--color-border);">
 *             <uix-icon name="search" size="sm"></uix-icon>
 *           </button>
 *           <uix-text size="xs">Find</uix-text>
 *         </uix-flex>
 *       </uix-flex>
 *     </section>
 *
 *     <!-- Transactions History -->
 *     <section>
 *       <uix-flex justify="space-between" align="center" style="margin-bottom: var(--spacing-md)">
 *         <uix-heading level="6">Transactions</uix-heading>
 *         <uix-flex align="center" gap="xs">
 *           <uix-text size="sm" color="muted">Today</uix-text>
 *           <uix-icon name="chevron-down" size="sm"></uix-icon>
 *         </uix-flex>
 *       </uix-flex>
 *       <uix-flex direction="column" gap="sm">
 *         <uix-card shadow="sm" hover>
 *           <uix-flex align="center" justify="space-between" style="padding: var(--spacing-md)">
 *             <uix-flex align="center" gap="md">
 *               <div style="width: 48px; height: 48px; border-radius: 12px; background: #000; display: flex; align-items: center; justify-content: center">
 *                 <uix-icon name="apple" color="inverse" size="lg"></uix-icon>
 *               </div>
 *               <uix-flex direction="column" gap="none">
 *                 <uix-text weight="semibold">Dinner</uix-text>
 *                 <uix-text size="sm" color="muted">13th April 2022</uix-text>
 *               </uix-flex>
 *             </uix-flex>
 *             <uix-text weight="bold" color="danger">-$45</uix-text>
 *           </uix-flex>
 *         </uix-card>
 *         <uix-card shadow="sm" hover>
 *           <uix-flex align="center" justify="space-between" style="padding: var(--spacing-md)">
 *             <uix-flex align="center" gap="md">
 *               <uix-avatar name="John Doe" size="md"></uix-avatar>
 *               <uix-flex direction="column" gap="none">
 *                 <uix-text weight="semibold">Birthday Gift</uix-text>
 *                 <uix-text size="sm" color="muted">13th April 2022</uix-text>
 *               </uix-flex>
 *             </uix-flex>
 *             <uix-text weight="bold" color="danger">-$220</uix-text>
 *           </uix-flex>
 *         </uix-card>
 *         <uix-card shadow="sm" hover>
 *           <uix-flex align="center" justify="space-between" style="padding: var(--spacing-md)">
 *             <uix-flex align="center" gap="md">
 *               <div style="width: 48px; height: 48px; border-radius: 12px; background: var(--color-warning-light); display: flex; align-items: center; justify-content: center">
 *                 <uix-icon name="shopping-bag" color="warning" size="lg"></uix-icon>
 *               </div>
 *               <uix-flex direction="column" gap="none">
 *                 <uix-text weight="semibold">House Cleaning</uix-text>
 *                 <uix-text size="sm" color="muted">10th April 2022</uix-text>
 *               </uix-flex>
 *             </uix-flex>
 *             <uix-text weight="bold" color="danger">-$55</uix-text>
 *           </uix-flex>
 *         </uix-card>
 *       </uix-flex>
 *     </section>
 *   </uix-flex>
 *
 *     <!-- Bottom Navigation -->
 *     <uix-bottom-nav slot="bottom-nav">
 *       <a href="/" class="active"><uix-icon name="house"></uix-icon>Home</a>
 *       <a href="/wallet"><uix-icon name="credit-card"></uix-icon>Wallet</a>
 *       <a href="/stats"><uix-icon name="chart-bar-big"></uix-icon>Stats</a>
 *       <a href="/profile"><uix-icon name="user"></uix-icon>Profile</a>
 *     </uix-bottom-nav>
 *   </uix-app-container>
 * </uix-device>
 * ```
 *
 * @example Mobile Stats Dashboard (800px)
 * ```html
 * <uix-device device="iphone" height="800px">
 *   <uix-app-container layout="mobile">
 *   <uix-app-header slot="header">
 *     <uix-heading slot="title" level="5">Statistics</uix-heading>
 *     <button slot="end"><uix-icon name="bell"></uix-icon></button>
 *   </uix-app-header>
 *   <uix-flex direction="column" gap="lg" style="padding: var(--spacing-lg);">
 *     <uix-metric-hero-card
 *       label="This Month"
 *       value="$8,628"
 *       subtitle="Compared to Last Month"
 *       gradientFrom="#11998e"
 *       gradientTo="#38ef7d"
 *       shadow="md"
 *     >
 *       <div slot="chart">
 *         <uix-flex gap="xs" align="end" style="height: 60px;">
 *           <div style="flex: 1; background: rgba(255,255,255,0.3); border-radius: 4px; height: 45%;"></div>
 *           <div style="flex: 1; background: rgba(255,255,255,0.7); border-radius: 4px; height: 75%;"></div>
 *           <div style="flex: 1; background: rgba(255,255,255,0.9); border-radius: 4px; height: 100%;"></div>
 *           <div style="flex: 1; background: rgba(255,255,255,0.7); border-radius: 4px; height: 85%;"></div>
 *           <div style="flex: 1; background: rgba(255,255,255,0.5); border-radius: 4px; height: 65%;"></div>
 *         </uix-flex>
 *       </div>
 *     </uix-metric-hero-card>
 *     <section>
 *       <uix-heading level="6" style="margin-bottom: var(--spacing-md)">Overview</uix-heading>
 *       <uix-grid columns="2" gap="md">
 *         <uix-stat-card
 *           label="Total Users"
 *           value="1,234"
 *           change="+8%"
 *           changeVariant="success"
 *           icon="trending-up"
 *           shadow="sm"
 *         ></uix-stat-card>
 *         <uix-stat-card
 *           label="Tasks Done"
 *           value="560"
 *           change="+15%"
 *           changeVariant="success"
 *           icon="circle-check"
 *           shadow="sm"
 *         ></uix-stat-card>
 *         <uix-stat-card
 *           label="Page Views"
 *           value="12.3k"
 *           change="+5%"
 *           changeVariant="warning"
 *           icon="eye"
 *           shadow="sm"
 *         ></uix-stat-card>
 *         <uix-stat-card
 *           label="Active Now"
 *           value="89"
 *           change="-2%"
 *           changeVariant="danger"
 *           icon="users"
 *           shadow="sm"
 *         ></uix-stat-card>
 *       </uix-grid>
 *     </section>
 *     <section>
 *       <uix-card shadow="md" style="--card-gradient-from: #ee9ca7; --card-gradient-to: #ffdde1; padding: var(--spacing-lg);">
 *         <uix-flex direction="column" gap="md">
 *           <uix-flex justify="space-between">
 *             <div>
 *               <uix-heading level="4" style="color: #d63447;">560 done</uix-heading>
 *               <uix-text size="sm" style="color: #d63447; opacity: 0.8;">268 works in progress</uix-text>
 *             </div>
 *             <div style="width: 80px; height: 80px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center;">
 *               <uix-text weight="bold" style="color: #d63447; font-size: 24px;">560</uix-text>
 *             </div>
 *           </uix-flex>
 *         </uix-flex>
 *       </uix-card>
 *     </section>
 *   </uix-flex>
 *     <uix-bottom-nav slot="bottom-nav">
 *       <a href="/"><uix-icon name="house"></uix-icon>Home</a>
 *       <a href="/stats" class="active"><uix-icon name="chart-bar"></uix-icon>Statistics</a>
 *       <a href="/settings"><uix-icon name="settings"></uix-icon>Settings</a>
 *     </uix-bottom-nav>
 *   </uix-app-container>
 * </uix-device>
 * ```
 *
 * @example Basic Mobile App
 * ```html
 * <uix-device device="iphone" height="800px">
 *   <uix-app-container layout="mobile">
 *     <uix-app-header slot="header" title="My App"></uix-app-header>
 *
 *     <div>Main content here</div>
 *
 *     <uix-bottom-nav slot="bottom-nav">
 *       <a href="/"><uix-icon name="house"></uix-icon>Home</a>
 *       <a href="/search"><uix-icon name="search"></uix-icon>Search</a>
 *       <a href="/profile"><uix-icon name="user"></uix-icon>Profile</a>
 *     </uix-bottom-nav>
 *   </uix-app-container>
 * </uix-device>
 * ```
 *
 * @example Basic Desktop App
 * ```html
 * <uix-app-container layout="desktop">
 *   <uix-title-bar slot="titlebar" title="My Application"></uix-title-bar>
 *
 *   <uix-sidebar slot="sidebar">
 *     <nav>
 *       <a href="/">Dashboard</a>
 *       <a href="/projects">Projects</a>
 *       <a href="/settings">Settings</a>
 *     </nav>
 *   </uix-sidebar>
 *
 *   <div>Main content here</div>
 * </uix-app-container>
 * ```
 *
 * @example Auto-Responsive (Default)
 * ```html
 * <uix-app-container
 *   layout="auto"
 *   @layout-change=${(e) => console.log('Layout changed:', e.detail.layout)}
 * >
 *   <!-- Mobile header -->
 *   <uix-app-header slot="header" title="My App"></uix-app-header>
 *
 *   <!-- Desktop titlebar -->
 *   <uix-title-bar slot="titlebar" title="My Application"></uix-title-bar>
 *
 *   <!-- Desktop sidebar -->
 *   <uix-sidebar slot="sidebar">
 *     <nav>Navigation links</nav>
 *   </uix-sidebar>
 *
 *   <div>Content that works on both layouts</div>
 * </uix-app-container>
 * ```
 *
 * @example With Routing
 * ```html
 * <uix-app-container
 *   .currentRoute=${this.route}
 *   @navigate=${(e) => this.handleNavigate(e.detail)}
 *   @route-change=${(e) => console.log('Route:', e.detail)}
 * >
 *   <div>${this.renderCurrentView()}</div>
 * </uix-app-container>
 * ```
 *
 * @example Full-Featured Mobile
 * ```html
 * <uix-app-container layout="mobile">
 *   <uix-app-header slot="header" title="Messages" show-back-button @back-click=${() => this.goBack()}>
 *     <button slot="end">
 *       <uix-icon name="search"></uix-icon>
 *     </button>
 *   </uix-app-header>
 *
 *   <div class="messages-list">
 *     ${this.messages.map(m => html`<div>${m.text}</div>`)}
 *   </div>
 *
 *   <uix-bottom-nav slot="bottom-nav">
 *     ${this.tabs.map(tab => html`<a href="${tab.href}">${tab.label}</a>`)}
 *   </uix-bottom-nav>
 * </uix-app-container>
 * ```
 *
 * @example Full-Featured Desktop
 * ```html
 * <uix-app-container layout="desktop" multi-pane>
 *   <uix-title-bar slot="titlebar" title="IDE - main.js"></uix-title-bar>
 *
 *   <uix-sidebar slot="sidebar" collapsible>
 *     <div slot="header">
 *       <img src="/logo.svg" alt="Logo">
 *     </div>
 *     <uix-tree .items=${this.files}></uix-tree>
 *   </uix-sidebar>
 *
 *   <div slot="toolbar">
 *     <uix-breadcrumbs .items=${this.path}></uix-breadcrumbs>
 *   </div>
 *
 *   <div>Code editor here</div>
 *
 *   <div slot="panel-secondary">
 *     Console output
 *   </div>
 *
 *   <div slot="status-bar">
 *     Line 42, Col 15
 *   </div>
 * </uix-app-container>
 * ```
 *
 *
 * @example Desktop with Navigation Drawer
 * ```html
 * <uix-app-container layout="desktop">
 *   <uix-title-bar slot="titlebar" title="Email Client">
 *     <button slot="start" onclick="document.querySelector('#emailDrawer').toggleDrawer()">
 *       <uix-icon name="menu"></uix-icon>
 *     </button>
 *   </uix-title-bar>
 *
 *   <!-- Navigation drawer using uix-drawer -->
 *   <uix-drawer id="emailDrawer" persistent open>
 *     <div style="padding: 1rem; background: var(--color-surface);">
 *       <h3>Folders</h3>
 *       <nav style="display: flex; flex-direction: column; gap: 0.5rem;">
 *         <a href="/inbox">📥 Inbox (12)</a>
 *         <a href="/drafts">📝 Drafts</a>
 *         <a href="/sent">📤 Sent</a>
 *         <a href="/spam">🚫 Spam</a>
 *         <a href="/trash">🗑️ Trash</a>
 *       </nav>
 *     </div>
 *   </uix-drawer>
 *
 *   <!-- Sidebar for account switching -->
 *   <uix-sidebar slot="sidebar">
 *     <div style="padding: 1rem;">
 *       <h4>Accounts</h4>
 *       <div>personal@email.com</div>
 *       <div>work@company.com</div>
 *     </div>
 *   </uix-sidebar>
 *
 *   <!-- Main email content -->
 *   <div>
 *     <h2>Email Messages</h2>
 *   </div>
 *
 *   <div slot="status-bar">
 *     12 messages • Last sync: 2 minutes ago
 *   </div>
 * </uix-app-container>
 * ```
 *
 * @example Complete Feature Showcase
 * ```html
 * <uix-app-container
 *   layout="auto"
 *   height="var(--app-height, 100vh)"
 *   multi-pane
 * >
 *   <!-- Mobile header -->
 *   <uix-app-header slot="header" title="My App">
 *     <button slot="start" onclick="document.querySelector('#featureDrawer').toggleDrawer()">
 *       <uix-icon name="menu"></uix-icon>
 *     </button>
 *   </uix-app-header>
 *
 *   <!-- Desktop titlebar -->
 *   <uix-title-bar slot="titlebar" title="My Application">
 *     <button slot="start" onclick="document.querySelector('#featureDrawer').toggleDrawer()">
 *       <uix-icon name="sidebar"></uix-icon>
 *     </button>
 *   </uix-title-bar>
 *
 *   <!-- Responsive drawer with navigation using uix-drawer -->
 *   <uix-drawer
 *     id="featureDrawer"
 *     width="320px"
 *     @drawer-opened=${(e) => console.log('Drawer opened')}
 *     @drawer-closed=${() => console.log('Drawer closed')}
 *   >
 *     <div style="padding: 2rem;">
 *       <h3 style="margin-bottom: 1rem;">Quick Actions</h3>
 *       <nav style="display: flex; flex-direction: column; gap: 0.75rem;">
 *         <a href="/new">➕ New Document</a>
 *         <a href="/recent">🕐 Recent Files</a>
 *         <a href="/starred">⭐ Starred</a>
 *         <a href="/shared">👥 Shared with me</a>
 *         <hr>
 *         <a href="/settings">⚙️ Settings</a>
 *         <a href="/help">❓ Help & Support</a>
 *       </nav>
 *     </div>
 *   </uix-drawer>
 *
 *   <!-- Desktop sidebar -->
 *   <uix-sidebar slot="sidebar" collapsible>
 *     <div>Main Navigation</div>
 *   </uix-sidebar>
 *
 *   <!-- Toolbar -->
 *   <div slot="toolbar">
 *     <uix-breadcrumbs .items=${['Home', 'Documents', 'Report.pdf']}></uix-breadcrumbs>
 *   </div>
 *
 *   <!-- Main content with proper scrolling -->
 *   <div style="padding: 2rem;">
 *     <h1>Content Area</h1>
 *     <p>This area scrolls independently while drawer, header, and bottom nav stay fixed.</p>
 *   </div>
 *
 *   <!-- Secondary panel (desktop multi-pane) -->
 *   <div slot="panel-secondary" style="padding: 1rem;">
 *     <h4>Properties</h4>
 *     <p>Document metadata and properties</p>
 *   </div>
 *
 *   <!-- Bottom nav (mobile) -->
 *   <uix-bottom-nav slot="bottom-nav">
 *     <a href="/"><uix-icon name="house"></uix-icon>Home</a>
 *     <a href="/search"><uix-icon name="search"></uix-icon>Search</a>
 *     <a href="/favorites"><uix-icon name="star"></uix-icon>Favorites</a>
 *     <a href="/profile"><uix-icon name="user"></uix-icon>Profile</a>
 *   </uix-bottom-nav>
 *
 *   <!-- Status bar (desktop) -->
 *   <div slot="status-bar">
 *     Ready • Line 42, Col 15 • UTF-8
 *   </div>
 * </uix-app-container>
 * ```
 *
 * @example Custom Height Control
 * ```html
 * <!-- Using property -->
 * <uix-app-container height="600px">
 *   <!-- content -->
 * </uix-app-container>
 *
 * <!-- Using CSS variable -->
 * <uix-app-container style="--app-container-height: calc(100vh - 80px)">
 *   <!-- content -->
 * </uix-app-container>
 *
 * <!-- Dynamic height from JavaScript -->
 * <uix-app-container id="myApp"></uix-app-container>
 * <script>
 *   document.getElementById('myApp').height = '800px';
 *   // Or via CSS variable:
 *   document.getElementById('myApp').style.setProperty('--app-container-height', '800px');
 * </script>
 * ```
 */
