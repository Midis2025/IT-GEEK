import { Icon } from "@/components/ui/Icon";
import { site } from "@/lib/site";

export function TopBar() {
  return (
    <div className="hidden bg-navy-800 sm:block">
      <div className="container-page flex items-center justify-center gap-6 py-2.5 text-sm leading-[22px] text-on-dark-muted lg:justify-between">
        <p className="flex items-center gap-2">
          <Icon name="topbar-map-pin" size={16} />
          Australian remote IT support — Microsoft 365 &amp; antivirus specialists
        </p>
        <div className="hidden items-center gap-6 lg:flex">
          <p className="flex items-center gap-2">
            <Icon name="topbar-clock" size={16} />
            {site.hours}
          </p>
          <a href={`mailto:${site.email}`} className="-my-1 flex items-center gap-2 py-1 transition-colors hover:text-white">
            <Icon name="topbar-mail" size={16} />
            {site.email}
          </a>
        </div>
      </div>
    </div>
  );
}
