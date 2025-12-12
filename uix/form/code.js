import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "https://esm.sh/@codemirror/commands";
import { css } from "https://esm.sh/@codemirror/lang-css";
import { html } from "https://esm.sh/@codemirror/lang-html";
import { javascript } from "https://esm.sh/@codemirror/lang-javascript";
import { indentUnit } from "https://esm.sh/@codemirror/language";
import { SearchCursor, SearchQuery } from "https://esm.sh/@codemirror/search";
import {
  EditorState,
  StateEffect,
  StateField,
} from "https://esm.sh/@codemirror/state";
import {
  Decoration,
  EditorView,
  highlightSpecialChars,
  keymap,
  lineNumbers,
} from "https://esm.sh/@codemirror/view";
import { gruvboxDark } from "https://esm.sh/@fsegurai/codemirror-theme-gruvbox-dark";

// Language map for synchronous loading
const langMap = {
  javascript,
  css,
  html,
};

// Assuming T is imported correctly in your environment
// For demonstration, let's create a mock T
const T = {
  string: () => ({ type: "string" }),
  function: () => ({ type: "function" }),
  number: (options) => ({ type: "number", ...options }),
  boolean: (defaultValue) => ({ type: "boolean", default: defaultValue }),
  array: (defaultValue) => ({ type: "array", default: defaultValue }),
};
// import T from "/node_modules/@bootstrapp/types/index.js";

export default {
  tag: "textarea",
  class: "flex flex-grow",
  style: true,
  properties: {
    content: T.string(),
    language: T.string(),
    onUpdate: T.function(),
    path: T.string(),
    cursor: T.number({ sync: "local", scope: "path" }),
    readonly: T.boolean(false),
    lineNumber: T.boolean(true),
    findMatches: T.array([]),
    currentFindIndex: T.number(-1),
    findDecorations: T.array([]),
  },
  isUpdatingFromOutside: false,

  setCursorPosition(position) {
    if (this.view && position != null) {
      const docLength = this.view.state.doc.length;
      const validPosition = Math.min(Math.max(0, position), docLength);
      this.view.dispatch({
        selection: { anchor: validPosition },
        scrollIntoView: true,
      });
    }
  },

  goToLine(lineNumber) {
    if (!this.view) return;
    try {
      // Get the starting position of the requested line
      const line = this.view.state.doc.line(lineNumber);
      this.view.dispatch({
        selection: { anchor: line.from },
        effects: EditorView.scrollIntoView(line.from, { y: "center" }),
      });
      this.view.focus();
    } catch (e) {
      console.warn(`Could not go to line ${lineNumber}`, e);
    }
  },

  /**
   * Inserts text at the current cursor position or replaces the current selection.
   * @param {string} text The text to insert into the editor.
   */
  insertTextAtCursor(text) {
    if (!this.view) {
      console.warn("Editor view not available. Cannot insert text.");
      return;
    }

    this.view.dispatch({
      changes: {
        from: this.view.state.selection.main.from,
        to: this.view.state.selection.main.to,
        insert: text,
      },
      selection: {
        anchor: this.view.state.selection.main.from + text.length,
      },
    });
    this.view.focus();
  },

  /**
   * Creates a search query object for CodeMirror
   */
  createSearchQuery(query, options = {}) {
    if (!query) return null;
    if (!this.SearchQuery) {
      this.SearchQuery = SearchQuery; // Ensure it's set if connected hasn't run
    }

    try {
      return new this.SearchQuery({
        search: query,
        caseSensitive: options.matchCase || false,
        regexp: options.useRegex || false,
        wholeWord: options.wholeWord || false,
      });
    } catch (e) {
      console.error("Invalid search query:", e);
      return null;
    }
  },

  /**
   * Find all matches in the document
   */
  find(query, options = {}) {
    if (!this.view || !query) return { currentMatch: 0, totalMatches: 0 };

    if (!this.SearchCursor) {
      this.SearchCursor = SearchCursor; // Ensure it's set
    }

    const searchQuery = this.createSearchQuery(query, options);
    console.log({ searchQuery });
    if (!searchQuery) {
      return { currentMatch: 0, totalMatches: 0 };
    }

    // Clear previous decorations
    this.clearFindDecorations();

    const doc = this.view.state.doc;
    const matches = [];

    // Use SearchCursor to find all matches
    const cursor = new this.SearchCursor(doc, query, 0, doc.length);

    // Find all matches
    while (!cursor.done) {
      const next = cursor.next();
      if (!next.done) {
        matches.push({
          from: next.value.from,
          to: next.value.to,
        });
      }
    }

    this.findMatches = matches;
    if (matches.length === 0) {
      this.currentFindIndex = -1;
      return { currentMatch: 0, totalMatches: 0 };
    }

    // Find the match closest to current cursor position
    const cursorPos = this.view.state.selection.main.head;
    let closestIndex = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    matches.forEach((match, index) => {
      const distance = Math.abs(match.from - cursorPos);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    this.currentFindIndex = closestIndex;

    // Add decorations
    this.addFindDecorations();

    // Scroll to current match
    if (matches[this.currentFindIndex]) {
      const match = matches[this.currentFindIndex];
      this.view.dispatch({
        selection: { anchor: match.from, head: match.to },
        effects: EditorView.scrollIntoView(match.from, { y: "center" }),
      });
    }

    return {
      currentMatch: this.currentFindIndex + 1,
      totalMatches: matches.length,
    };
  },

  /**
   * Add decorations for all matches
   */
  addFindDecorations() {
    if (!this.view) return;

    if (!this.Decoration) this.Decoration = Decoration;
    if (!this.StateEffect) this.StateEffect = StateEffect;

    const decorations = this.findMatches.map((match, index) => {
      const isCurrent = index === this.currentFindIndex;
      return this.Decoration.mark({
        class: isCurrent ? "cm-searchMatch-current" : "cm-searchMatch",
      }).range(match.from, match.to);
    });

    if (decorations.length > 0) {
      this.view.dispatch({
        effects: this.addDecorations.of(decorations),
      });
    }
  },

  /**
   * Go to next match
   */
  findNext(query, options = {}) {
    if (!this.view || this.findMatches.length === 0) {
      return this.find(query, options);
    }

    this.currentFindIndex =
      (this.currentFindIndex + 1) % this.findMatches.length;

    // Scroll to match
    const match = this.findMatches[this.currentFindIndex];
    this.view.dispatch({
      selection: { anchor: match.from, head: match.to },
      effects: EditorView.scrollIntoView(match.from, { y: "center" }),
    });

    return {
      currentMatch: this.currentFindIndex + 1,
      totalMatches: this.findMatches.length,
    };
  },

  /**
   * Go to previous match
   */
  findPrevious(query, options = {}) {
    if (!this.view || this.findMatches.length === 0) {
      return this.find(query, options);
    }

    this.currentFindIndex = this.currentFindIndex - 1;
    if (this.currentFindIndex < 0) {
      this.currentFindIndex = this.findMatches.length - 1;
    }

    // Scroll to match
    const match = this.findMatches[this.currentFindIndex];
    this.view.dispatch({
      selection: { anchor: match.from, head: match.to },
      effects: EditorView.scrollIntoView(match.from, { y: "center" }),
    });

    return {
      currentMatch: this.currentFindIndex + 1,
      totalMatches: this.findMatches.length,
    };
  },

  /**
   * Replace the current match
   */
  replaceNext(findQuery, replaceQuery, options = {}) {
    if (
      !this.view ||
      this.findMatches.length === 0 ||
      this.currentFindIndex < 0
    ) {
      return this.find(findQuery, options);
    }

    const currentMatch = this.findMatches[this.currentFindIndex];

    // Replace current match
    this.view.dispatch({
      changes: {
        from: currentMatch.from,
        to: currentMatch.to,
        insert: replaceQuery,
      },
    });

    // Re-run find to update matches
    const result = this.find(findQuery, options);

    // If there are still matches, move to next one
    if (result.totalMatches > 0) {
      return this.findNext(findQuery, options);
    }

    return result;
  },

  /**
   * Replace all matches
   */
  replaceAll(findQuery, replaceQuery, options = {}) {
    if (!this.view) return 0;

    // First, find all matches
    this.find(findQuery, options);

    if (this.findMatches.length === 0) return 0;

    const count = this.findMatches.length;

    // Create changes for all matches (in reverse order to maintain positions)
    const changes = [...this.findMatches].reverse().map((match) => ({
      from: match.from,
      to: match.to,
      insert: replaceQuery,
    }));

    // Apply all replacements at once
    this.view.dispatch({ changes });

    // Clear find state
    this.clearFindDecorations();

    return count;
  },

  /**
   * Clear all find decorations
   */
  clearFindDecorations() {
    if (this.view && this.clearDecorations) {
      this.view.dispatch({
        effects: this.clearDecorations.of(null),
      });
    }
    this.findMatches = [];
    this.currentFindIndex = -1;
  },

  getLanguageFromPath(path) {
    if (!path) return null;
    const ext = path.split(".").pop()?.toLowerCase();
    const extMap = {
      js: "javascript",
      jsx: "javascript",
      mjs: "javascript",
      cjs: "javascript",
      css: "css",
      html: "html",
      htm: "html",
      json: "javascript",
    };
    return extMap[ext] || null;
  },

  connected() {
    const parent = this;
    if (!parent || this.view) return;

    // Modules are imported at the top, so we assign them to `this`
    // for use in other methods.
    this.EditorView = EditorView;
    this.EditorState = EditorState;
    this.Decoration = Decoration;
    this.StateEffect = StateEffect;
    this.SearchQuery = SearchQuery;
    this.SearchCursor = SearchCursor;

    this.addDecorations = StateEffect.define();
    this.clearDecorations = StateEffect.define();

    const decorationField = StateField.define({
      create() {
        return Decoration.none;
      },
      update(decorations, tr) {
        for (const effect of tr.effects) {
          if (effect.is(this.addDecorations)) {
            decorations = Decoration.set(effect.value);
          }
          if (effect.is(this.clearDecorations)) {
            decorations = Decoration.none;
          }
        }
        return decorations;
      },
      provide: (f) => EditorView.decorations.from(f),
    });

    const detectedLanguage =
      this.language || this.getLanguageFromPath(this.path);

    // Use the sync langMap
    const langExtension = [];
    if (detectedLanguage && langMap[detectedLanguage]) {
      const langFunc = langMap[detectedLanguage];
      if (typeof langFunc === "function") {
        langExtension.push(langFunc());
      } else {
        console.warn(
          `CodeMirror language function for "${detectedLanguage}" not found.`,
        );
      }
    }

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && this.onUpdate) {
        const newContent = update.state.doc.toString();
        this.isUpdatingFromOutside = true;
        this.onUpdate(newContent);
        queueMicrotask(() => {
          this.isUpdatingFromOutside = false;
        });
      }

      if (update.selectionSet) {
        const newCursor = update.state.selection.main.head;
        if (newCursor !== this.cursor) {
          this.cursor = newCursor;
        }
      }
    });

    const customFontSize = EditorView.theme({
      ".cm-editor": {
        fontSize: "12px",
      },
    });

    const findTheme = EditorView.theme({
      ".cm-searchMatch": {
        backgroundColor: "rgba(234, 92, 0, 0.3)",
      },
      ".cm-searchMatch-current": {
        backgroundColor: "rgba(250, 189, 47, 0.5)",
        outline: "1px solid rgba(250, 189, 47, 0.8)",
      },
    });

    const extensions = [
      ...(this.lineNumber ? [lineNumbers()] : []),
      highlightSpecialChars(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      gruvboxDark,
      customFontSize,
      findTheme,
      EditorView.lineWrapping,
      ...langExtension,
      updateListener,
      decorationField,
      indentUnit.of("  "),
      EditorState.tabSize.of(2),
      EditorState.readOnly.of(this.readonly),
    ];

    const state = EditorState.create({
      doc: this.content || "",
      extensions: extensions,
    });
    const opts = { state, parent, root: this.getRootNode() };
    this.view = new EditorView(opts);
    if (!this.readonly) this.view.focus();

    this.setCursorPosition(this.cursor);
  },

  updated({ changedProps }) {
    if (
      this.view &&
      changedProps.has("content") &&
      !this.isUpdatingFromOutside
    ) {
      const currentDoc = this.view.state.doc.toString();
      if (currentDoc !== this.content) {
        const cursorPos = this.view.state.selection.main.head;

        this.view.dispatch({
          changes: {
            from: 0,
            to: currentDoc.length,
            insert: this.content || "",
          },
          selection: {
            anchor: Math.min(cursorPos, (this.content || "").length),
          },
        });
      }
    }

    if (
      this.view &&
      changedProps.has("cursor") &&
      !this.isUpdatingFromOutside
    ) {
      const currentCursor = this.view.state.selection.main.head;
      if (this.cursor != null && this.cursor !== currentCursor) {
        this.setCursorPosition(this.cursor);
      }
    }
  },

  disconnected() {
    if (this.view) {
      this.view.destroy();
      this.view = null;
    }

    // Clear the stored instances
    this.EditorView = null;
    this.EditorState = null;
    this.Decoration = null;
    this.StateEffect = null;
    this.SearchQuery = null;
    this.SearchCursor = null;
    this.addDecorations = null;
    this.clearDecorations = null;
  },
};
