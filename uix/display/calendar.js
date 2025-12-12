import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

// Utility functions for calendar logic
const generateRecurringInstances = (event, startDate, endDate) => {
  if (!event.isRecurring) return [];
  const instances = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  const recurrenceEnd = event.recurrenceEndDate
    ? new Date(event.recurrenceEndDate)
    : new Date(current.getTime() + 31536000000); // 1 year default
  const originalDate = new Date(event.date);

  const shouldGenerate = (date, evt, origDate) => {
    switch (evt.recurrencePattern) {
      case "daily":
        return true;
      case "weekly":
        return date.getDay() === origDate.getDay();
      case "monthly":
        return date.getDate() === origDate.getDate();
      case "custom":
        return evt.recurrenceDays?.includes(date.getDay());
      default:
        return false;
    }
  };

  const advance = (date, pattern) => {
    switch (pattern) {
      case "daily":
        date.setDate(date.getDate() + 1);
        break;
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "custom":
        date.setDate(date.getDate() + 1);
        break;
    }
  };

  while (current <= end && current <= recurrenceEnd) {
    if (shouldGenerate(current, event, originalDate)) {
      instances.push({
        ...event,
        id: `${event.id}-${current.toISOString().split("T")[0]}`,
        date: current.toISOString().split("T")[0],
        recurrenceParentId: event.id,
        isRecurring: false,
      });
    }
    advance(current, event.recurrencePattern);
  }
  return instances;
};

const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const isThisWeek = (date) => {
  const today = new Date();
  const weekFromNow = new Date(today.getTime() + 604800000);
  return date >= today && date <= weekFromNow;
};

const getDateSection = (dateStr, locale) => {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isSameDay(date, today)) return "TODAY";
  if (isSameDay(date, tomorrow)) return "TOMORROW";
  if (isThisWeek(date))
    return date.toLocaleDateString(locale, { weekday: "long" }).toUpperCase();
  return date
    .toLocaleDateString(locale, { month: "short", day: "numeric" })
    .toUpperCase();
};

const groupEventsByDate = (events) =>
  events.reduce(
    (groups, event) => ({
      ...groups,
      [event.date]: [...(groups[event.date] || []), event],
    }),
    {},
  );

const getEventsInRange = (startDate, endDate, events) => {
  const withRecurring = [];

  events.forEach((event) => {
    if (event.isRecurring) {
      withRecurring.push(...generateRecurringInstances(event, startDate, endDate));
    } else {
      const eventDate = new Date(event.date);
      if (eventDate >= startDate && eventDate <= endDate) {
        withRecurring.push(event);
      }
    }
  });
  return withRecurring.sort((a, b) => new Date(a.date) - new Date(b.date));
};

const formatMonthYear = (month, year, locale) =>
  new Date(year, month, 1)
    .toLocaleDateString(locale, { month: "long", year: "numeric" })
    .toUpperCase();

const getDaysInMonth = (year, month, events) => {
  const days = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventsByDate = events.reduce(
    (groups, event) => ({
      ...groups,
      [event.date]: [...(groups[event.date] || []), event],
    }),
    {},
  );

  // Previous month padding
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    const dateStr = date.toISOString().split("T")[0];
    days.push({
      date,
      day: date.getDate(),
      isCurrentMonth: false,
      isToday: false,
      events: eventsByDate[dateStr] || [],
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split("T")[0];
    date.setHours(0, 0, 0, 0);
    days.push({
      date,
      day,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      events: eventsByDate[dateStr] || [],
    });
  }

  // Next month padding (fill to 42 days = 6 weeks)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i);
    const dateStr = date.toISOString().split("T")[0];
    days.push({
      date,
      day: date.getDate(),
      isCurrentMonth: false,
      isToday: false,
      events: eventsByDate[dateStr] || [],
    });
  }

  return days;
};

export default {
  tag: "uix-calendar",
  style: true,
  shadow: true,
  properties: {
    // Data
    events: T.array({ defaultValue: [] }),

    // View state
    viewMode: T.string({ defaultValue: "month", enum: ["list", "month"] }),
    currentMonth: T.number(new Date().getMonth()),
    currentYear: T.number(new Date().getFullYear()),
    selectedDate: T.string(""),
    showDayPanel: T.boolean(false),

    // Config
    showViewToggle: T.boolean(true),
    showNavigation: T.boolean(true),
    showTodayButton: T.boolean(true),
    locale: T.string("en"),
    monthsAhead: T.number(3),
  },

  // Get events for the calendar range (for list view)
  getEventsForCalendar() {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + this.monthsAhead);
    return getEventsInRange(today, endDate, this.events || []);
  },

  // Navigation handlers
  handleNav(direction) {
    if (direction === -1) {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
    } else {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
    }
    this.showDayPanel = false;
    this.emit("month-change", {
      month: this.currentMonth,
      year: this.currentYear,
    });
  },

  handleTodayClick() {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.showDayPanel = false;
  },

  handleViewToggle(mode) {
    this.viewMode = mode;
  },

  handleDayClick(dayObj) {
    const dateStr = dayObj.date.toISOString().split("T")[0];
    const hasEvents = dayObj.events.length > 0;
    if (this.selectedDate === dateStr) {
      this.showDayPanel = !this.showDayPanel && hasEvents;
    } else {
      this.selectedDate = dateStr;
      this.showDayPanel = hasEvents;
    }
    this.emit("day-click", { date: dateStr, events: dayObj.events });
  },

  handleClosePanel() {
    this.showDayPanel = false;
  },

  handleEventClick(event, e) {
    e?.stopPropagation();
    this.emit("event-click", { event });
  },

  getEventsForSelectedDay() {
    if (!this.selectedDate) return [];
    return this.getEventsForCalendar().filter(
      (e) => e.date === this.selectedDate,
    );
  },

  render() {
    const events = this.getEventsForCalendar();
    const groupedEvents = groupEventsByDate(events);

    return html`
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      </style>

      <div class="calendar-container" part="container">
        ${this.showViewToggle ? this.renderViewToggle() : null}
        ${this.viewMode === "list"
          ? this.renderListView(groupedEvents)
          : this.renderGridView(events)}
      </div>
    `;
  },

  renderViewToggle() {
    return html`
      <div class="view-toggle" part="view-toggle">
        <button
          @click=${() => this.handleViewToggle("list")}
          class="toggle-btn ${this.viewMode === "list" ? "active" : ""}"
          part="toggle-btn ${this.viewMode === "list" ? "toggle-btn-active" : ""}"
        >
          List
        </button>
        <button
          @click=${() => this.handleViewToggle("month")}
          class="toggle-btn ${this.viewMode === "month" ? "active" : ""}"
          part="toggle-btn ${this.viewMode === "month" ? "toggle-btn-active" : ""}"
        >
          Month
        </button>
      </div>
    `;
  },

  renderListView(groupedEvents) {
    const dateKeys = Object.keys(groupedEvents).sort();

    if (dateKeys.length === 0) {
      return html`
        <div class="empty-state" part="empty">
          <div class="empty-icon">📅</div>
          <p class="empty-text">No events scheduled</p>
        </div>
      `;
    }

    return html`
      <div class="list-view" part="list">
        ${dateKeys.map((dateKey) => {
          const eventsForDate = groupedEvents[dateKey];
          const section = getDateSection(dateKey, this.locale);
          return html`
            <div class="list-section" part="list-section">
              <h2 class="list-section-title" part="list-section-title">${section}</h2>
              <div class="list-items">
                ${eventsForDate.map(
                  (event) => html`
                    <div
                      @click=${(e) => this.handleEventClick(event, e)}
                      class="list-item"
                      part="list-item"
                      data-category="${event.category || ""}"
                    >
                      ${event.image
                        ? html`<img
                            src="${event.image}"
                            alt="${event.title}"
                            class="list-item-image"
                            part="list-item-image"
                          />`
                        : null}
                      <div class="list-item-content" part="list-item-content">
                        <div class="list-item-header">
                          <h3 class="list-item-title" part="list-item-title">${event.title}</h3>
                          ${event.recurrenceParentId
                            ? html`<span class="recurring-badge" part="recurring-badge">🔁</span>`
                            : null}
                        </div>
                        <p class="list-item-meta" part="list-item-meta">
                          ${event.time || ""} ${event.venue || event.address ? `• ${event.venue || event.address}` : ""}
                        </p>
                        <slot name="list-item-extra" .event=${event}></slot>
                      </div>
                    </div>
                  `,
                )}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  },

  renderGridView(events) {
    const days = getDaysInMonth(this.currentYear, this.currentMonth, events);
    const monthYearLabel = formatMonthYear(this.currentMonth, this.currentYear, this.locale);
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return html`
      <div class="grid-view" part="grid-view">
        ${this.showNavigation ? html`
          <div class="grid-header" part="header">
            <button
              @click=${() => this.handleNav(-1)}
              class="nav-btn"
              part="nav-btn nav-btn-prev"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <h2 class="month-label" part="month-label">${monthYearLabel}</h2>
            <button
              @click=${() => this.handleNav(1)}
              class="nav-btn"
              part="nav-btn nav-btn-next"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        ` : null}

        ${this.showTodayButton ? html`
          <button
            @click=${this.handleTodayClick.bind(this)}
            class="today-btn"
            part="today-btn"
          >
            Jump to Today
          </button>
        ` : null}

        <div class="grid-container" part="grid">
          <div class="weekday-header" part="weekday-header">
            ${weekDays.map(
              (day) => html`<div class="weekday" part="weekday">${day}</div>`,
            )}
          </div>
          <div class="days-grid" part="days-grid">
            ${days.map((dayObj) => {
              const isSelected =
                this.selectedDate === dayObj.date.toISOString().split("T")[0];
              const hasEvents = dayObj.events.length > 0;
              return html`
                <div
                  @click=${() => this.handleDayClick(dayObj)}
                  class="day-cell ${dayObj.isToday ? "today" : ""} ${isSelected ? "selected" : ""} ${!dayObj.isCurrentMonth ? "other-month" : ""} ${hasEvents ? "has-events" : ""}"
                  part="day ${dayObj.isToday ? "day-today" : ""} ${isSelected ? "day-selected" : ""} ${!dayObj.isCurrentMonth ? "day-other-month" : ""}"
                >
                  <span class="day-number" part="day-number">${dayObj.day}</span>
                  ${hasEvents
                    ? html`
                        <div class="day-events" part="day-events">
                          ${dayObj.events.slice(0, 2).map(
                            (event) => html`
                              <div
                                class="event-indicator"
                                part="event"
                                data-category="${event.category || ""}"
                              >
                                ${event.title.length > 12
                                  ? event.title.substring(0, 12) + "..."
                                  : event.title}
                              </div>
                            `,
                          )}
                          ${dayObj.events.length > 2
                            ? html`<div class="more-events" part="more-events">+${dayObj.events.length - 2} more</div>`
                            : null}
                        </div>
                      `
                    : null}
                </div>
              `;
            })}
          </div>
        </div>

        ${this.showDayPanel ? this.renderDayDetailPanel() : null}
      </div>
    `;
  },

  renderDayDetailPanel() {
    const selectedEvents = this.getEventsForSelectedDay();
    const selectedDateObj = new Date(this.selectedDate);
    const dateLabel = selectedDateObj
      .toLocaleDateString(this.locale, {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
      .toUpperCase();

    return html`
      <div
        @click=${this.handleClosePanel.bind(this)}
        class="panel-overlay"
        part="panel-overlay"
        style="animation: fadeIn 0.2s ease-out;"
      ></div>
      <div class="day-panel" part="panel" style="animation: slideUp 0.3s ease-out;">
        <div class="panel-header" part="panel-header">
          <h3 class="panel-title" part="panel-title">${dateLabel}</h3>
          <button
            @click=${this.handleClosePanel.bind(this)}
            class="panel-close"
            part="panel-close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="panel-content" part="panel-content">
          ${selectedEvents.length === 0
            ? html`<p class="panel-empty" part="panel-empty">No events on this day</p>`
            : selectedEvents.map(
                (event) => html`
                  <div
                    @click=${(e) => this.handleEventClick(event, e)}
                    class="panel-item"
                    part="panel-item"
                    data-category="${event.category || ""}"
                  >
                    ${event.image
                      ? html`<img
                          src="${event.image}"
                          alt="${event.title}"
                          class="panel-item-image"
                          part="panel-item-image"
                        />`
                      : null}
                    <div class="panel-item-content" part="panel-item-content">
                      <div class="panel-item-header">
                        <h4 class="panel-item-title" part="panel-item-title">${event.title}</h4>
                        ${event.recurrenceParentId
                          ? html`<span class="recurring-badge" part="recurring-badge">🔁</span>`
                          : null}
                      </div>
                      <p class="panel-item-meta" part="panel-item-meta">
                        ${event.time || ""} ${event.venue || event.address ? `• ${event.venue || event.address}` : ""}
                      </p>
                    </div>
                  </div>
                `,
              )}
        </div>
      </div>
    `;
  },
};

/**
 * Calendar Component
 *
 * @component
 * @category display
 * @tag uix-calendar
 *
 * A full-featured calendar component with list and month grid views,
 * recurring event support, and day detail panels.
 *
 * @slot - Default slot for additional content
 *
 * @part container - Main calendar container
 * @part view-toggle - View mode toggle container
 * @part toggle-btn - Toggle button
 * @part toggle-btn-active - Active toggle button
 * @part header - Grid view header with navigation
 * @part nav-btn - Navigation buttons
 * @part month-label - Current month/year label
 * @part today-btn - Jump to today button
 * @part grid - Calendar grid container
 * @part weekday-header - Weekday names row
 * @part weekday - Individual weekday name
 * @part days-grid - Grid of day cells
 * @part day - Individual day cell
 * @part day-today - Today's day cell
 * @part day-selected - Selected day cell
 * @part day-other-month - Day cell from adjacent month
 * @part day-number - Day number text
 * @part day-events - Container for event indicators
 * @part event - Event indicator in grid
 * @part more-events - "+N more" indicator
 * @part list - List view container
 * @part list-section - Date section in list view
 * @part list-section-title - Section title (TODAY, TOMORROW, etc.)
 * @part list-item - Event item in list view
 * @part list-item-image - Event image in list
 * @part list-item-content - Event content container
 * @part list-item-title - Event title
 * @part list-item-meta - Event time/venue info
 * @part recurring-badge - Recurring event indicator
 * @part panel - Day detail panel
 * @part panel-overlay - Panel backdrop overlay
 * @part panel-header - Panel header
 * @part panel-title - Panel date title
 * @part panel-close - Panel close button
 * @part panel-content - Panel event list
 * @part panel-item - Event item in panel
 * @part panel-empty - Empty panel message
 * @part empty - Empty state container
 *
 * @fires day-click - When a day is clicked. Detail: { date: string, events: array }
 * @fires event-click - When an event is clicked. Detail: { event: object }
 * @fires month-change - When month changes. Detail: { month: number, year: number }
 *
 * @example Basic Calendar
 * ```html
 * <uix-calendar
 *   .events=${[
 *     { id: "1", date: "2024-01-15", title: "Meeting" },
 *     { id: "2", date: "2024-01-20", title: "Conference", isRecurring: true, recurrencePattern: "weekly" }
 *   ]}
 * ></uix-calendar>
 * ```
 *
 * @example List View Only
 * ```html
 * <uix-calendar
 *   viewMode="list"
 *   .showViewToggle=${false}
 *   .events=${events}
 * ></uix-calendar>
 * ```
 */
