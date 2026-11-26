import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";

type Issue = { icon: string; type: "Microsoft 365" | "Security"; title: string; text: string };

const issues: Issue[] = [
  { icon: "mail-blue", type: "Microsoft 365", title: "Outlook won’t send or receive", text: "Stuck outbox, endless password prompts, missing emails or a corrupt profile." },
  { icon: "issue-video", type: "Microsoft 365", title: "Teams calls drop or won’t sign in", text: "Audio and video problems, sign-in loops, missing chats and meeting glitches." },
  { icon: "issue-cloud", type: "Microsoft 365", title: "OneDrive or SharePoint won’t sync", text: "Sync errors, duplicate files, red crosses and documents that won’t open." },
  { icon: "issue-key", type: "Microsoft 365", title: "Activation & licence errors", text: "“Unlicensed product” banners, wrong subscriptions and account mix-ups." },
  { icon: "issue-bug", type: "Security", title: "Pop-ups, slowdowns or a virus", text: "Full malware scan and clean-up, including browser hijackers and adware." },
  { icon: "issue-shield-alert", type: "Security", title: "Ransomware or a hacked account", text: "Rapid containment, account lockdown and recovery before damage spreads." },
  { icon: "issue-lock", type: "Security", title: "Clicked a phishing link?", text: "We check what was exposed, reset passwords and secure your mailbox." },
  { icon: "issue-shield-check", type: "Security", title: "Antivirus expired or clashing", text: "Renewals, removing duplicate security tools and setting up proper protection." },
];

export function CommonIssues() {
  return (
    <section id="common-issues" aria-labelledby="issues-title" className="section-y bg-subtle">
      <div className="container-page flex flex-col items-center gap-10 lg:gap-14">
        <SectionHeader
          id="issues-title"
          eyebrow="Common issues"
          title="Sound familiar? We fix it fast."
          subtitle="These are the problems we solve every day — most of them in a single remote session."
        />

        <ul className="grid w-full gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {issues.map((issue) => {
            const m365 = issue.type === "Microsoft 365";
            return (
              <li key={issue.title} className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6 sm:p-7 lg:p-6 xl:p-7">
                <div className="flex items-center justify-between gap-3">
                  <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${m365 ? "bg-brand-soft" : "bg-green-soft"}`}>
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

        <div className="flex w-full max-w-[860px] flex-col items-center gap-4 rounded-3xl border border-line bg-white p-5 text-center sm:w-auto sm:flex-row sm:gap-5 sm:rounded-full sm:py-4 sm:pr-4 sm:pl-7 sm:text-left">
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
