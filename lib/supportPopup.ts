/**
 * Scheduling rules for the Support Booking popup, kept free of React so they are easy to reason about.
 *
 * Per browser session (sessionStorage, so it survives refreshes and in-site navigation but not a new session):
 *   - at most MAX_APPEARANCES appearances;
 *   - 1st: FIRST_DELAY_MS after the page loads;
 *   - 2nd: GAPS_MS[0] after the 1st appeared; 3rd: GAPS_MS[1] after the 2nd appeared;
 *   - a successful enquiry (from the popup or the main enquiry form) stops it for the rest of the session.
 *
 * Two guards keep it from feeling pushy:
 *   - after a close, the next appearance is never sooner than MIN_GAP_AFTER_CLOSE_MS (someone who kept the popup
 *     open for longer than the gap is not shown it again the moment they close it);
 *   - after a page load, nothing appears sooner than FIRST_DELAY_MS.
 */

export const MAX_APPEARANCES = 3;
export const FIRST_DELAY_MS = 10_000;
/** Gap before the 2nd and 3rd appearances, measured from the previous appearance. */
export const GAPS_MS = [60_000, 90_000] as const;
export const MIN_GAP_AFTER_CLOSE_MS = 10_000;
/** How long to wait before re-checking when the visitor is busy (another form, menu or dialog). */
export const BUSY_RETRY_MS = 5_000;

const STORAGE_KEY = "itgeek:support-popup";

/** Fired on window when any enquiry is submitted successfully. */
export const ENQUIRY_SUBMITTED_EVENT = "itgeek:enquiry-submitted";

export type PopupState = {
  /** Appearances so far this session. */
  shown: number;
  /** Epoch ms when the next appearance is due (absent before the first appearance). */
  nextAt?: number;
  /** A successful enquiry was sent this session: never show again. */
  done: boolean;
};

const INITIAL: PopupState = { shown: 0, done: false };

export function readState(): PopupState {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...INITIAL };
    const parsed = JSON.parse(raw) as Partial<PopupState>;
    return {
      shown: Number.isInteger(parsed.shown) && parsed.shown! >= 0 ? parsed.shown! : 0,
      nextAt: typeof parsed.nextAt === "number" && Number.isFinite(parsed.nextAt) ? parsed.nextAt : undefined,
      done: parsed.done === true,
    };
  } catch {
    // Storage blocked (privacy mode) or corrupt: fall back to in-memory defaults for this page view.
    return { ...INITIAL };
  }
}

export function writeState(state: PopupState): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — the popup still respects the limits within this page view */
  }
}

export function isFinished(state: PopupState): boolean {
  return state.done || state.shown >= MAX_APPEARANCES;
}

/**
 * Milliseconds from `now` until the next appearance, or null if the popup must not appear again.
 * `sinceLoad` is how long the page has been loaded (performance.now()), so the "10 seconds after the page loads"
 * rule is measured from navigation, not from when React finished hydrating.
 */
export function delayUntilNext(state: PopupState, now: number, sinceLoad = 0): number | null {
  if (isFinished(state)) return null;
  const afterLoad = Math.max(FIRST_DELAY_MS - sinceLoad, 0);
  if (state.shown === 0 || state.nextAt === undefined) return afterLoad;
  return Math.max(state.nextAt - now, afterLoad);
}

/** State after the popup appears at `now`. */
export function recordAppearance(state: PopupState, now: number): PopupState {
  const shown = state.shown + 1;
  const gap = GAPS_MS[shown - 1];
  return { ...state, shown, nextAt: gap === undefined ? undefined : now + gap };
}

/** State after the visitor closes the popup at `now` without submitting. */
export function recordClose(state: PopupState, now: number): PopupState {
  if (isFinished(state) || state.nextAt === undefined) return state;
  return { ...state, nextAt: Math.max(state.nextAt, now + MIN_GAP_AFTER_CLOSE_MS) };
}

/** Call after any successful enquiry: stops the popup for the rest of the session. */
export function markEnquirySubmitted(): void {
  writeState({ ...readState(), done: true });
  window.dispatchEvent(new Event(ENQUIRY_SUBMITTED_EVENT));
}

/**
 * True while the visitor is busy with something the popup should not interrupt: another open dialog (e.g. the main
 * enquiry form), the open mobile menu, or a focused form field anywhere on the page.
 */
export function visitorIsBusy(popup: HTMLDialogElement | null): boolean {
  if (Array.from(document.querySelectorAll("dialog[open]")).some((d) => d !== popup)) return true;
  const menu = document.getElementById("mobile-menu");
  if (menu && !menu.hidden) return true;
  const active = document.activeElement;
  return !!active && active.matches("input, textarea, select, [contenteditable=''], [contenteditable='true']");
}
