import Navigation from "./Navigation";
import ForSaleBanner from "./ForSaleBanner";
import { getCurrentPartner } from "@/lib/auth";
import { getAdmin } from "@/lib/admin";

interface HeaderProps {
  forsale?: string;
  forsaletext?: string;
  domain?: string;
  affiliateLink?: string;
}

export default async function Header({
  domain = "ipartner.com",
  forsale,
  forsaletext,
  affiliateLink,
}: HeaderProps) {
  const partner = await getCurrentPartner();
  const admin = partner ? await getAdmin() : null;

  const session = partner
    ? {
        email: partner.email,
        label:
          [partner.firstName, partner.lastName].filter(Boolean).join(" ") ||
          partner.email.split("@")[0] ||
          partner.email,
        isAdmin: Boolean(admin),
      }
    : null;

  return (
    <header className="relative">
      {forsale === "1" && (
        <ForSaleBanner domain={domain} text={forsaletext} affiliateLink={affiliateLink} />
      )}
      <Navigation session={session} />
    </header>
  );
}
