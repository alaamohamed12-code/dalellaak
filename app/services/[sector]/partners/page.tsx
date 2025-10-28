import { redirect } from 'next/navigation';

export default function LegacyPartnersRedirect({ params }: { params: { sector: string } }) {
  // Redirect old URLs like /services/contracting/partners to /services/contracting
  redirect(`/services/${params.sector}`);
}
