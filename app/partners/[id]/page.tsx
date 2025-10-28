"use client";
import { notFound } from 'next/navigation';
import { useLang } from '../../../components/layout/Providers';
import Header from '../../../components/layout/Header';
import Image from 'next/image';


export default function PartnerProfile({ params }: { params: { id: string } }) {
  const { lang } = useLang();
  // Legacy page relied on static partnersData which no longer exists.
  // Until we wire this to real company profiles, show 404 to avoid crashes.
  return notFound();
  // eslint-disable-next-line no-unreachable
  return null;
}
