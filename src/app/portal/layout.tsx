import { requirePartner } from "@/lib/auth";
import { getAdmin } from "@/lib/admin";
import PortalShell from "@/components/portal/PortalShell";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const partner = await requirePartner("/portal");
  const admin = await getAdmin();
  const label =
    [partner.firstName, partner.lastName].filter(Boolean).join(" ") ||
    partner.email.split("@")[0] ||
    partner.email;

  return (
    <PortalShell
      session={{
        email: partner.email,
        label,
        isAdmin: Boolean(admin),
      }}
    >
      {children}
    </PortalShell>
  );
}
