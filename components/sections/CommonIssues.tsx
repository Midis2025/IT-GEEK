import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";

type Issue = { icon: string; type: "Microsoft 365" | "Security"; title: string; text: string };

const issues: Issue[] = [
  { icon: "mail-blue", type: "Microsoft 365", title: "Outlook won’t send or receive", text: "Stuck outbox, endless password prompts, missing emails or a corrupt profile." },
  { icon: "issue-cloud", type: "Microsoft 365", title: "OneDrive won’t sync", text: "Sync errors, duplicate files, red crosses and documents that won’t open." },
  { icon: "product-word", type: "Microsoft 365", title: "Word or Excel won’t open", text: "Files that won’t open or save, crashes and confusing error messages." },
  { icon: "issue-key", type: "Microsoft 365", title: "Office errors after an update", text: "Apps that won’t start, missing features and updates that fail to install." },
  { icon: "issue-bug", type: "Security", title: "Pop-ups, slowdowns or a virus", text: "Full malware scan and clean-up, including browser hijackers and adware." },
  { icon: "issue-shield-alert", type: "Security", title: "Spyware or a Trojan", text: "Finding and removing spyware, Trojans and other malicious software." },
  { icon: "issue-lock", type: "Security", title: "Passwords & firewall setup", text: "Setting up a password manager, firewall and browser ad blocker." },
  { icon: "issue-shield-check", type: "Security", title: "No security software?", text: "Installing internet security software so your devices stay protected." },
];

export function CommonIssues() {
  return (
    <section id="common-issues" aria-labelledby="issues-title" className="section-y bg-ambient-subtle">
      <div className="container-page flex flex-col items-center gap-10 lg:gap-14">
        <SectionHeader
          id="issues-title"
          eyebrow="Common issues"
          title="Sound familiar? We fix it fast."
          subtitle="Everyday problems our technicians help with — software issues and virus removal are often handled online."
        />

        <ul data-reveal-group className="grid w-full gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {issues.map((issue) => {
            const m365 = issue.type === "Microsoft 365";
            return (
              <li key={issue.title} className="glass-light lift flex flex-col gap-4 rounded-2xl p-6 sm:p-7 lg:p-6 xl:p-7">
                <div className="flex items-center justify-between gap-3">
                  <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${m365 ? "bg-brand-soft ring-brand/10" : "bg-green-soft ring-green/10"}`}>
                    <Icon name={issue.icon} size={24} />
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-sm leading-5 font-semibold whitespace-nowrap ${m365 ? "bg-brand-soft text-brand" : "bg-green-soft text-green-ink"}`}
                  >
                    {issue.type}
                  </span>
                </div>
                <h3 className="text-h5 text-heading">{issue.title}</h3>
                <p className="text-sm leading-[22px] text-body">{issue.text}</p>
              </li>
            );
          })}
        </ul>

        <div data-reveal className="glass-light flex w-full max-w-[860px] flex-col items-center gap-4 rounded-3xl p-5 text-center sm:w-auto sm:flex-row sm:gap-5 sm:rounded-full sm:py-4 sm:pr-4 sm:pl-7 sm:text-left">
          <Icon name="issue-message" size={20} className="max-sm:hidden" />
          <p className="text-base leading-[26px] text-heading lg:whitespace-nowrap">
            Don’t see your issue? If it’s Microsoft 365 or security related, we can help.
          </p>
          <Button size="md" enquiry="Something else" icon="issue-arrow" className="max-sm:w-full">
            Describe your issue
          </Button>
        </div>
      </div>
    </section>
  );
}
