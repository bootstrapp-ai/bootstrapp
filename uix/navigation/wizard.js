import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-wizard",
  style: true,
  shadow: true,
  properties: {
    // State
    currentStep: T.number(1),
    totalSteps: T.number(1),

    // Config
    showProgress: T.boolean(true),
    showStepCounter: T.boolean(true),
    showNavigation: T.boolean(true),
    modal: T.boolean(false),

    // Labels (i18n support)
    backLabel: T.string("← Back"),
    nextLabel: T.string("Next →"),
    cancelLabel: T.string("Cancel"),
    finishLabel: T.string("Finish"),
    stepLabel: T.string("Step"),

    // Callbacks
    canProceed: T.function(),
  },

  nextStep() {
    // Check if canProceed callback exists and returns false
    if (this.canProceed && !this.canProceed(this.currentStep)) {
      return false;
    }

    const previousStep = this.currentStep;
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.emit("step-change", {
        step: this.currentStep,
        previousStep,
        direction: "forward",
      });
      return true;
    } else {
      this.emit("wizard-finish", {});
      return true;
    }
  },

  prevStep() {
    const previousStep = this.currentStep;
    if (this.currentStep > 1) {
      this.currentStep--;
      this.emit("step-change", {
        step: this.currentStep,
        previousStep,
        direction: "backward",
      });
      return true;
    } else {
      this.emit("wizard-cancel", {});
      return false;
    }
  },

  goToStep(step) {
    if (step >= 1 && step <= this.totalSteps) {
      const previousStep = this.currentStep;
      const direction = step > previousStep ? "forward" : "backward";
      this.currentStep = step;
      this.emit("step-change", {
        step: this.currentStep,
        previousStep,
        direction,
      });
      return true;
    }
    return false;
  },

  handleBackClick() {
    this.prevStep();
  },

  handleNextClick() {
    this.nextStep();
  },

  render() {
    const progress = (this.currentStep / this.totalSteps) * 100;
    const isFirstStep = this.currentStep === 1;
    const isLastStep = this.currentStep >= this.totalSteps;

    // Generate slot names for all steps
    const stepSlots = [];
    for (let i = 1; i <= this.totalSteps; i++) {
      stepSlots.push(html`
        <div
          class="step-content ${i === this.currentStep ? "active" : ""}"
          style="display: ${i === this.currentStep ? "block" : "none"}"
        >
          <slot name="step-${i}"></slot>
        </div>
      `);
    }

    const content = html`
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .wizard-overlay {
          animation: fadeIn 0.2s ease-out;
        }
      </style>

      <div class="wizard-container" part="container">
        <!-- Header -->
        <div class="wizard-header" part="header">
          <button
            @click=${this.handleBackClick.bind(this)}
            class="btn-back"
            part="btn-back"
          >
            ${isFirstStep ? this.cancelLabel : this.backLabel}
          </button>
          ${this.showStepCounter
            ? html`
                <div class="step-counter" part="step-counter">
                  ${this.stepLabel} ${this.currentStep}/${this.totalSteps}
                </div>
              `
            : null}
          <div class="header-spacer"></div>
        </div>

        <!-- Progress Bar -->
        ${this.showProgress
          ? html`
              <div class="wizard-progress" part="progress">
                <div
                  class="wizard-progress-fill"
                  part="progress-fill"
                  style="width: ${progress}%"
                ></div>
              </div>
            `
          : null}

        <!-- Step Content -->
        <div class="wizard-content" part="content">
          ${stepSlots}
        </div>

        <!-- Footer Navigation -->
        ${this.showNavigation
          ? html`
              <div class="wizard-footer" part="footer">
                <slot name="footer">
                  <button
                    @click=${this.handleNextClick.bind(this)}
                    class="btn-next"
                    part="btn-next"
                  >
                    ${isLastStep ? this.finishLabel : this.nextLabel}
                  </button>
                </slot>
              </div>
            `
          : null}
      </div>
    `;

    // Modal mode wraps content with overlay
    if (this.modal) {
      return html`
        <div
          class="wizard-overlay"
          part="overlay"
          @click=${(e) => {
            if (e.target === e.currentTarget) {
              this.emit("wizard-cancel", {});
            }
          }}
        >
          ${content}
        </div>
      `;
    }

    return content;
  },
};

/**
 * Wizard Component
 *
 * @component
 * @category navigation
 * @tag uix-wizard
 *
 * A multi-step wizard/stepper component for guiding users through
 * sequential processes like onboarding, forms, or setup flows.
 *
 * @slot step-1 - Content for step 1
 * @slot step-2 - Content for step 2
 * @slot step-N - Content for step N (up to totalSteps)
 * @slot footer - Custom footer content (replaces default next button)
 *
 * @part overlay - Modal backdrop (when modal=true)
 * @part container - Main wizard container
 * @part header - Header with back button and step counter
 * @part btn-back - Back/cancel button
 * @part step-counter - Step X/Y indicator
 * @part progress - Progress bar container
 * @part progress-fill - Progress bar fill element
 * @part content - Step content area
 * @part footer - Footer with navigation button
 * @part btn-next - Next/finish button
 *
 * @fires step-change - When step changes. Detail: { step, previousStep, direction }
 * @fires wizard-finish - When wizard completes (next on last step)
 * @fires wizard-cancel - When wizard is cancelled (back on first step or overlay click)
 *
 * @example Basic Wizard
 * ```html
 * <uix-wizard .totalSteps=${3}>
 *   <div slot="step-1">
 *     <h2>Welcome</h2>
 *     <p>Let's get started!</p>
 *   </div>
 *   <div slot="step-2">
 *     <h2>Your Details</h2>
 *     <input type="text" placeholder="Name" />
 *   </div>
 *   <div slot="step-3">
 *     <h2>Complete!</h2>
 *     <p>You're all set.</p>
 *   </div>
 * </uix-wizard>
 * ```
 *
 * @example Modal Wizard
 * ```html
 * <uix-wizard
 *   modal
 *   .totalSteps=${4}
 *   nextLabel="Continue →"
 *   finishLabel="Complete ✨"
 *   @wizard-finish=${handleComplete}
 *   @wizard-cancel=${handleClose}
 * >
 *   <div slot="step-1">Step 1 content</div>
 *   <div slot="step-2">Step 2 content</div>
 *   <div slot="step-3">Step 3 content</div>
 *   <div slot="step-4">Step 4 content</div>
 * </uix-wizard>
 * ```
 *
 * @example Wizard with Validation
 * ```html
 * <uix-wizard
 *   .totalSteps=${3}
 *   .canProceed=${(step) => {
 *     if (step === 1) return !!this.name;
 *     if (step === 2) return !!this.email;
 *     return true;
 *   }}
 * >
 *   ...
 * </uix-wizard>
 * ```
 */
