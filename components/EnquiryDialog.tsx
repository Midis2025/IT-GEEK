"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  ENQUIRY_TOPICS,
  LIMITS,
  normaliseEnquiry,
  validateEnquiry,
  type EnquiryErrors,
  type EnquiryField,
  type EnquiryInput,
} from "@/lib/enquiry";
import { createIdempotencyKey, submitEnquiry } from "@/lib/api/enquiries";
import { privacyPolicyUrl, site, withBasePath } from "@/lib/site";
import { markEnquirySubmitted } from "@/lib/supportPopup";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; enquiryId?: string }
  | { kind: "error"; message: string };

const EMPTY: EnquiryInput = { name: "", email: "", phone: "", topic: ENQUIRY_TOPICS[0], message: "" };
const FIELD_ORDER: EnquiryField[] = ["name", "email", "phone", "topic", "message"];

const inputBase =
  "block w-full rounded-[10px] border bg-white px-4 text-base leading-6 text-heading placeholder:text-muted/70 transition-[border-color,box-shadow] duration-150 outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";

export function EnquiryDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const startedAt = useRef(0);
  // One idempotency key per logical submission: reused only while retrying the exact same data.
  const attempt = useRef<{ key: string; fingerprint: string } | null>(null);
  const inFlight = useRef(false);
  const uid = useId();

  const [values, setValues] = useState<EnquiryInput>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<EnquiryField, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const clientErrors = validateEnquiry(normaliseEnquiry(values));
  const errorFor = (f: EnquiryField) => serverErrors[f] ?? (touched[f] ? clientErrors[f] : undefined);

  const open = useCallback((topic?: string) => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    setStatus((s) => (s.kind === "success" ? { kind: "idle" } : s));
    setValues((v) => ({
      ...v,
      topic: topic && (ENQUIRY_TOPICS as readonly string[]).includes(topic) ? topic : v.topic,
    }));
    startedAt.current = Date.now();
    dialog.showModal();
    document.documentElement.style.overflow = "hidden";
  }, []);

  const close = () => dialogRef.current?.close();

  // Any link marked with data-enquiry opens the dialog (progressive enhancement over its #contact href).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const trigger = (e.target as Element | null)?.closest<HTMLElement>("[data-enquiry]");
      if (!trigger) return;
      e.preventDefault();
      open(trigger.dataset.enquiry);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      document.documentElement.style.overflow = "";
      if (status.kind === "success") {
        setValues(EMPTY);
        setTouched({});
        setServerErrors({});
      }
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [status.kind]);

  useEffect(() => {
    if (status.kind === "success") successRef.current?.focus();
  }, [status.kind]);

  const update = (field: EnquiryField, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (serverErrors[field]) setServerErrors(({ [field]: _removed, ...rest }) => rest);
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Prevent duplicate submissions. The ref blocks clicks that land before React re-renders the disabled button.
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
      markEnquirySubmitted(); // also stops the Support Booking popup for this session
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

  const submitting = status.kind === "submitting";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${uid}-title`}
      className="m-auto w-[calc(100%-1.5rem)] max-w-[560px] rounded-3xl bg-linear-to-b from-white from-60% to-subtle p-0 text-body shadow-floating ring-1 ring-brand/10 backdrop:bg-navy-900/60 backdrop:backdrop-blur-md open:motion-safe:animate-[dialog-in_220ms_cubic-bezier(0.22,0.61,0.36,1)]"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto p-6 sm:p-9">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id={`${uid}-title`} className="text-h3 text-heading">
              {status.kind === "success" ? "Enquiry received" : "Get help from a specialist"}
            </h2>
            {status.kind !== "success" && (
              <p className="mt-1.5 text-sm leading-[22px] text-body">
                Tell us what’s wrong and a Microsoft 365 or security specialist will get back to you. Support hours:{" "}
                {site.hours.replace(" · ", ", ")}.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="-mt-1 -mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-heading transition-[background-color,rotate] duration-200 hover:rotate-90 hover:bg-brand-soft"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {status.kind === "success" ? (
          <div role="status" className="flex flex-col items-start gap-5">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-green-soft">
              <Icon name="scan-shield" size={28} />
            </span>
            <h3 ref={successRef} tabIndex={-1} className="text-h4 text-heading outline-none">
              Thanks, {normaliseEnquiry(values).name.split(" ")[0]} — we’re on it.
            </h3>
            <p className="text-base leading-[26px]">
              We’ve received your enquiry and will contact you at <strong className="text-heading">{values.email}</strong>.
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
              onClick={close}
              className="inline-flex min-h-12 items-center justify-center rounded-[10px] bg-brand px-6 font-semibold text-white hover:bg-brand-hover"
            >
              Done
            </button>
          </div>
        ) : (
          <form ref={formRef} noValidate onSubmit={onSubmit} aria-busy={submitting} className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor={`${uid}-name`} className="mb-1.5 block text-sm leading-5 font-semibold text-heading">
                  Your name
                </label>
                <input {...fieldProps("name")} onChange={(e) => update("name", e.target.value)} type="text" autoComplete="name" maxLength={LIMITS.name} required className={`${fieldProps("name").className} h-12`} />
                {fieldError("name")}
              </div>
              <div>
                <label htmlFor={`${uid}-phone`} className="mb-1.5 block text-sm leading-5 font-semibold text-heading">
                  Phone <span className="font-normal text-muted">(optional)</span>
                </label>
                <input {...fieldProps("phone")} onChange={(e) => update("phone", e.target.value)} type="tel" autoComplete="tel" inputMode="tel" maxLength={LIMITS.phone} placeholder="04xx xxx xxx" className={`${fieldProps("phone").className} h-12`} />
                {fieldError("phone")}
              </div>
            </div>

            <div>
              <label htmlFor={`${uid}-email`} className="mb-1.5 block text-sm leading-5 font-semibold text-heading">
                Email address
              </label>
              <input {...fieldProps("email")} onChange={(e) => update("email", e.target.value)} type="email" autoComplete="email" inputMode="email" maxLength={LIMITS.email} required className={`${fieldProps("email").className} h-12`} />
              {fieldError("email")}
            </div>

            <div>
              <label htmlFor={`${uid}-topic`} className="mb-1.5 block text-sm leading-5 font-semibold text-heading">
                What do you need help with?
              </label>
              <select {...fieldProps("topic")} onChange={(e) => update("topic", e.target.value)} style={{ backgroundImage: `url(${withBasePath("/figma/select-chevron.svg")})` }} className={`${fieldProps("topic").className} h-12 appearance-none bg-[length:20px] bg-[right_14px_center] bg-no-repeat pr-11`}>
                {ENQUIRY_TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {fieldError("topic")}
            </div>

            <div>
              <label htmlFor={`${uid}-message`} className="mb-1.5 block text-sm leading-5 font-semibold text-heading">
                Describe your issue
              </label>
              <textarea {...fieldProps("message")} onChange={(e) => update("message", e.target.value)} rows={4} maxLength={LIMITS.message} required placeholder="e.g. Outlook keeps asking for my password and won’t send emails." className={`${fieldProps("message").className} resize-y py-3`} />
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
                </a>{" "}
                or email{" "}
                <a href={`mailto:${site.email}`} className="font-semibold whitespace-nowrap text-brand underline underline-offset-4">
                  {site.email}
                </a>
                .
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-[10px] bg-brand px-[26px] py-4 text-base font-semibold text-white shadow-[0_8px_20px_-8px_rgb(11_99_229/0.6)] transition-[background-color,box-shadow,translate] duration-200 hover:-translate-y-px hover:bg-brand-hover hover:shadow-[0_12px_26px_-8px_rgb(11_99_229/0.65)] active:translate-y-px disabled:cursor-wait disabled:opacity-80 disabled:hover:translate-y-0"
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
                  Send enquiry
                  <Icon name="arrow-right-white" size={20} />
                </>
              )}
            </button>
            <p className="text-center text-xs leading-5 text-muted">
              We use your details to respond to your enquiry, as set out in our{" "}
              <a href={privacyPolicyUrl} className="underline underline-offset-2 hover:text-heading">
                Privacy policy
              </a>
              . Nothing is accessed on your device without your OK.
            </p>
          </form>
        )}
      </div>
    </dialog>
  );
}
