"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { createIdempotencyKey, submitEnquiry } from "@/lib/api/enquiries";
import {
  LIMITS,
  normaliseEnquiry,
  validateEnquiry,
  type EnquiryErrors,
  type EnquiryField,
  type EnquiryInput,
  type EnquiryTopic,
} from "@/lib/enquiry";
import { privacyPolicyUrl, site } from "@/lib/site";
import {
  BUSY_RETRY_MS,
  ENQUIRY_SUBMITTED_EVENT,
  delayUntilNext,
  markEnquirySubmitted,
  readState,
  recordAppearance,
  recordClose,
  visitorIsBusy,
  writeState,
} from "@/lib/supportPopup";

/**
 * Recurring "Book support" popup. Shown at most three times per browser session (see lib/supportPopup.ts), it reuses
 * the main enquiry form's validation, CRM field mapping and submission logic: the two service cards are existing
 * enquiry topics, which lib/api/enquiries.ts maps 1:1 onto the CRM's "Microsoft 365 help" and
 * "Antivirus & security help" service categories.
 */

type Service = { topic: EnquiryTopic; title: string; text: string; icon: string; tile: string };

const SERVICES: Service[] = [
  {
    topic: "Microsoft 365 help",
    title: "Microsoft 365 Support",
    text: "Outlook, OneDrive, Office apps",
    icon: "service-grid",
    tile: "bg-brand",
  },
  {
    topic: "Antivirus & security help",
    title: "Antivirus Support",
    text: "Viruses, malware, security software",
    icon: "service-shield",
    tile: "bg-green-ink",
  },
];

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; enquiryId?: string }
  | { kind: "error"; message: string };

const EMPTY: EnquiryInput = { name: "", email: "", phone: "", topic: "", message: "" };
const FIELD_ORDER: EnquiryField[] = ["topic", "name", "email", "phone", "message"];
const CLOSE_ANIMATION_MS = 200;

const inputBase =
  "block w-full rounded-[10px] border bg-white px-4 text-base leading-6 text-heading placeholder:text-muted/70 transition-[border-color,box-shadow] duration-150 outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";

export function SupportBookingPopup() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const startedAt = useRef(0);
  const attempt = useRef<{ key: string; fingerprint: string } | null>(null);
  const inFlight = useRef(false);
  const uid = useId();

  const [values, setValues] = useState<EnquiryInput>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<EnquiryField, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const statusRef = useRef(status);
  statusRef.current = status;

  const clientErrors = validateEnquiry(normaliseEnquiry(values));
  const errorFor = (f: EnquiryField) => serverErrors[f] ?? (touched[f] ? clientErrors[f] : undefined);

  const clearTimer = () => {
    window.clearTimeout(timer.current);
    timer.current = undefined;
  };

  /** Schedules the next appearance from the stored session state (no-op once finished). */
  const schedule = useCallback(() => {
    clearTimer();
    const delay = delayUntilNext(readState(), Date.now(), performance.now());
    if (delay === null) return;
    timer.current = window.setTimeout(function attemptShow() {
      timer.current = undefined;
      const dialog = dialogRef.current;
      if (!dialog || dialog.open) return;
      if (delayUntilNext(readState(), Date.now()) === null) return; // finished meanwhile (e.g. another tab)
      // Never interrupt: wait while the visitor uses another form, dialog or menu, or the tab is in the background.
      if (document.hidden || visitorIsBusy(dialog)) {
        timer.current = window.setTimeout(attemptShow, BUSY_RETRY_MS);
        return;
      }
      writeState(recordAppearance(readState(), Date.now()));
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      startedAt.current = Date.now();
      dialog.removeAttribute("data-closing");
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
      headingRef.current?.focus();
    }, delay);
  }, []);

  /** Plays the exit animation, then closes the dialog (the "close" handler does the bookkeeping). */
  const requestClose = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog?.open || dialog.hasAttribute("data-closing")) return;
    dialog.setAttribute("data-closing", "");
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => dialog.close(), CLOSE_ANIMATION_MS);
  }, []);

  // Start the schedule once per page load; stop for good after any successful enquiry.
  useEffect(() => {
    schedule();
    const onSubmitted = () => clearTimer();
    window.addEventListener(ENQUIRY_SUBMITTED_EVENT, onSubmitted);
    return () => {
      clearTimer();
      window.clearTimeout(closeTimer.current);
      window.removeEventListener(ENQUIRY_SUBMITTED_EVENT, onSubmitted);
    };
  }, [schedule]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // Escape: animate out instead of the browser's instant close.
    const onCancel = (e: Event) => {
      e.preventDefault();
      requestClose();
    };
    const onClose = () => {
      dialog.removeAttribute("data-closing");
      document.documentElement.style.overflow = "";
      if (statusRef.current.kind !== "success") {
        writeState(recordClose(readState(), Date.now()));
        schedule();
      }
      // Return focus to where the visitor was, if it is still on the page.
      if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true });
      returnFocus.current = null;
    };
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("close", onClose);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onClose);
    };
  }, [requestClose, schedule]);

  useEffect(() => {
    if (status.kind === "success") successRef.current?.focus();
  }, [status.kind]);

  const update = (field: EnquiryField, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (serverErrors[field]) setServerErrors(({ [field]: _removed, ...rest }) => rest);
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inFlight.current || status.kind === "submitting") return;

    const data = normaliseEnquiry(values);
    const errors = validateEnquiry(data);
    setTouched({ name: true, email: true, phone: true, topic: true, message: true });
    if (Object.keys(errors).length > 0) {
      const first = FIELD_ORDER.find((f) => errors[f]);
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus({ kind: "submitting" });
    const website = (formRef.current?.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    const fingerprint = JSON.stringify(data);
    if (attempt.current?.fingerprint !== fingerprint) attempt.current = { key: createIdempotencyKey(), fingerprint };

    inFlight.current = true;
    const result = await submitEnquiry(data, {
      idempotencyKey: attempt.current.key,
      honeypot: website,
      startedAt: startedAt.current,
    }).finally(() => {
      inFlight.current = false;
    });

    if (result.ok) {
      attempt.current = null;
      markEnquirySubmitted();
      setStatus({ kind: "success", enquiryId: result.enquiryId });
      return;
    }
    if (result.fieldErrors) setServerErrors(result.fieldErrors);
    setStatus({ kind: "error", message: result.message });
  }

  const fieldProps = (f: EnquiryField) => {
    const err = errorFor(f);
    return {
      id: `${uid}-${f}`,
      name: f,
      value: values[f],
      "aria-invalid": err ? true : undefined,
      "aria-describedby": err ? `${uid}-${f}-error` : undefined,
      onBlur: () => setTouched((t) => ({ ...t, [f]: true })),
      className: `${inputBase} ${err ? "border-danger" : "border-line hover:border-heading/30"}`,
    };
  };

  const fieldError = (f: EnquiryField) => {
    const err = errorFor(f);
    return err ? (
      <p id={`${uid}-${f}-error`} className="mt-1.5 text-sm leading-5 text-danger">
        {err}
      </p>
    ) : null;
  };

  const label = "mb-1.5 block text-sm leading-5 font-semibold text-heading";
  const submitting = status.kind === "submitting";
  const topicError = errorFor("topic");
  const success = status.kind === "success";

  return (
    <dialog
      ref={dialogRef}
      id="support-booking-popup"
      aria-labelledby={`${uid}-title`}
      aria-describedby={success ? undefined : `${uid}-desc`}
      className="support-popup m-auto w-[calc(100%-1.5rem)] max-w-[600px] overflow-hidden rounded-3xl bg-white p-0 text-body shadow-[0_32px_64px_-24px_rgb(3_8_26/0.45)] ring-1 ring-brand/10"
      onClick={(e) => e.target === e.currentTarget && requestClose()}
    >
      {/* Close button sits outside the scrolling area so it stays visible on small screens. */}
      <button
        type="button"
        onClick={requestClose}
        aria-label="Close"
        className="absolute top-3 right-3 z-10 flex size-11 items-center justify-center rounded-full bg-white/90 text-heading transition-[background-color,rotate] duration-200 hover:rotate-90 hover:bg-brand-soft sm:top-4 sm:right-4"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain">
        {/* Header band: brand accent rule and a faint grid, kept light. */}
        <div className="relative border-b border-line bg-subtle px-6 pt-7 pb-6 sm:px-9 sm:pt-8">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand to-green-bright" />
          <h2
            ref={headingRef}
            id={`${uid}-title`}
            tabIndex={-1}
            className="text-h3 pr-12 text-heading outline-none"
          >
            {success ? "Support request received" : "Need IT Support? We’re Here to Help."}
          </h2>
          {!success && (
            <p id={`${uid}-desc`} className="mt-2 max-w-[480px] text-base leading-[26px] text-body">
              Get help with Microsoft 365 or Antivirus support. Tell us what you need and our team will get back to you.
            </p>
          )}
        </div>

        <div className="px-6 py-6 sm:px-9 sm:py-7">
          {success ? (
            <div role="status" className="flex flex-col items-start gap-5">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-green-soft">
                <Icon name="scan-shield" size={28} />
              </span>
              <h3 ref={successRef} tabIndex={-1} className="text-h4 text-heading outline-none">
                Thanks, {normaliseEnquiry(values).name.split(" ")[0]} — we’re on it.
              </h3>
              <p className="text-base leading-[26px]">
                We’ve received your request and will contact you at{" "}
                <strong className="text-heading">{normaliseEnquiry(values).email}</strong>.
                {status.enquiryId && (
                  <>
                    {" "}Your reference number is <strong className="text-heading">{status.enquiryId}</strong>.
                  </>
                )}{" "}
                Need help right now? Call us on{" "}
                <a href={site.phoneHref} className="font-semibold whitespace-nowrap text-brand underline underline-offset-4">
                  {site.phoneDisplay}
                </a>
                .
              </p>
              <button
                type="button"
                onClick={requestClose}
                className="inline-flex min-h-12 items-center justify-center rounded-[10px] bg-brand px-6 text-[15px] font-semibold text-white transition-colors hover:bg-brand-hover"
              >
                Done
              </button>
            </div>
          ) : (
            <form ref={formRef} noValidate onSubmit={onSubmit} aria-busy={submitting} className="flex flex-col gap-5 sm:gap-4">
              <fieldset aria-describedby={topicError ? `${uid}-topic-error` : undefined}>
                <legend className={label}>Service required</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {SERVICES.map((s, i) => {
                    const selected = values.topic === s.topic;
                    return (
                      <label
                        key={s.topic}
                        className={`relative flex cursor-pointer items-center gap-3.5 rounded-2xl border bg-white py-4 pr-11 pl-4 sm:flex-col sm:items-start sm:gap-3 sm:pr-4 transition-[border-color,box-shadow,background-color] duration-150 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand/20 ${
                          selected
                            ? "border-brand bg-brand-soft/40 shadow-[inset_0_0_0_1px_var(--color-brand)]"
                            : topicError
                              ? "border-danger/60 hover:border-danger"
                              : "border-line hover:border-brand/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="topic"
                          value={s.topic}
                          checked={selected}
                          onChange={() => {
                            update("topic", s.topic);
                            setTouched((t) => ({ ...t, topic: true }));
                          }}
                          aria-invalid={topicError && i === 0 ? true : undefined}
                          className="sr-only"
                        />
                        <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${s.tile}`}>
                          <Icon name={s.icon} size={22} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] leading-5 font-semibold text-heading">{s.title}</span>
                          <span className="mt-0.5 block text-sm leading-5 text-muted">{s.text}</span>
                        </span>
                        <span
                          aria-hidden="true"
                          className={`absolute top-3.5 right-3.5 flex size-5 items-center justify-center rounded-full border-2 transition-colors ${
                            selected ? "border-brand bg-brand" : "border-line bg-white"
                          }`}
                        >
                          {selected && <span className="size-1.5 rounded-full bg-white" />}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {fieldError("topic")}
              </fieldset>

              <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
                <div>
                  <label htmlFor={`${uid}-name`} className={label}>
                    Full name
                  </label>
                  <input {...fieldProps("name")} onChange={(e) => update("name", e.target.value)} type="text" autoComplete="name" maxLength={LIMITS.name} required className={`${fieldProps("name").className} h-12 sm:h-11`} />
                  {fieldError("name")}
                </div>
                <div>
                  <label htmlFor={`${uid}-email`} className={label}>
                    Email address
                  </label>
                  <input {...fieldProps("email")} onChange={(e) => update("email", e.target.value)} type="email" autoComplete="email" inputMode="email" maxLength={LIMITS.email} required className={`${fieldProps("email").className} h-12 sm:h-11`} />
                  {fieldError("email")}
                </div>
              </div>

              <div>
                <label htmlFor={`${uid}-phone`} className={label}>
                  Phone number <span className="font-normal text-muted">(optional)</span>
                </label>
                <input {...fieldProps("phone")} onChange={(e) => update("phone", e.target.value)} type="tel" autoComplete="tel" inputMode="tel" maxLength={LIMITS.phone} placeholder="04xx xxx xxx" className={`${fieldProps("phone").className} h-12 sm:h-11`} />
                {fieldError("phone")}
              </div>

              <div>
                <label htmlFor={`${uid}-message`} className={label}>
                  Brief description of the issue
                </label>
                <textarea {...fieldProps("message")} onChange={(e) => update("message", e.target.value)} rows={3} maxLength={LIMITS.message} required placeholder="e.g. Outlook keeps asking for my password and won’t send emails." className={`${fieldProps("message").className} resize-y py-3`} />
                {fieldError("message")}
              </div>

              {/* Honeypot — hidden from people and assistive tech, often filled by bots. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor={`${uid}-website`}>Website</label>
                <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
              </div>

              {status.kind === "error" && (
                <div role="alert" className="rounded-xl border border-danger/30 bg-danger/6 px-4 py-3 text-sm leading-[22px] text-heading">
                  <strong className="font-semibold">{status.message}</strong> Please try again, or call us on{" "}
                  <a href={site.phoneHref} className="font-semibold whitespace-nowrap text-brand underline underline-offset-4">
                    {site.phoneDisplay}
                  </a>
                  .
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="group inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-[10px] bg-brand px-6 py-3 text-[15px] font-semibold text-white shadow-[0_1px_2px_rgb(10_20_48/0.12)] transition-[background-color,translate] duration-200 hover:-translate-y-px hover:bg-brand-hover active:translate-y-px disabled:cursor-wait disabled:opacity-80 disabled:hover:translate-y-0"
                >
                  {submitting ? (
                    <>
                      <svg className="size-5 motion-safe:animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
                        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>
                      Book Support Now
                      <Icon name="arrow-right-white" size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
                <p className="flex items-center justify-center gap-2 text-sm leading-5 font-medium text-heading">
                  <Icon name="topbar-map-pin" size={16} />
                  Available for remote support across Australia.
                </p>
                <p className="text-center text-xs leading-5 text-muted">
                  We use your details to respond to your request, as set out in our{" "}
                  <a href={privacyPolicyUrl} className="underline underline-offset-2 hover:text-heading">
                    Privacy policy
                  </a>
                  .
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </dialog>
  );
}
