'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardHomePage() {
  const userInitials = 'ML';

  const metrics = [
    {
      val: '14',
      label: 'Partenaires actifs',
      sub: "Mis à jour aujourd'hui",
      style: { background: 'var(--navy)', border: 'none', color: '#fff' },
      subStyle: { color: 'rgba(255,255,255,0.5)', borderTop: '1px solid rgba(255,255,255,0.1)' },
      valStyle: { color: 'var(--gold)' },
    },
    {
      val: '32',
      label: 'Documents partagés ce mois',
      sub: '+8 cette semaine',
      style: { background: 'var(--bg-card)', border: '1px solid var(--border)' },
      subStyle: { color: 'var(--text-muted)', borderTop: '1px solid var(--border)' },
      valStyle: { color: 'var(--text-primary)' },
    },
    {
      val: '4',
      label: 'Factures en cours',
      sub: '12 500 000 FCFA',
      style: { background: 'var(--orange-bg)', border: '1px solid var(--orange)' },
      subStyle: { color: 'var(--orange)', borderTop: '1px solid rgba(139,69,19,0.2)' },
      valStyle: { color: 'var(--orange)' },
    },
    {
      val: '5',
      label: 'Marchés actifs',
      sub: '2 en clôture ce mois',
      style: { background: 'var(--green-bg)', border: '1px solid var(--green)' },
      subStyle: { color: 'var(--green)', borderTop: '1px solid rgba(45,106,79,0.2)' },
      valStyle: { color: 'var(--green)' },
    },
  ];

  const activity = [
    { partner: 'Total Gabon', action: 'Document partagé', doc: 'Audit T1 2026', status: 'Partagé', statusClass: 'badge-green' },
    { partner: 'Sogea-Satom', action: 'Compte rendu', doc: 'Réunion 08/04', status: 'Partagé', statusClass: 'badge-green' },
    { partner: 'Bolloré Matériaux', action: 'Facture', doc: 'FAC-2026-041', status: 'En cours', statusClass: 'badge-orange' },
    { partner: 'TotalEnergies', action: 'Info transmise', doc: 'Planning semaine 17', status: 'Envoyé', statusClass: 'badge-gray' },
  ];

  const notifications = [
    { text: 'Document partagé avec Total Gabon', time: 'il y a 2h', read: false },
    { text: 'Nouveau message de Sogea-Satom', time: 'il y a 5h', read: false },
    { text: 'Facture FAC-2026-041 en attente', time: 'Hier', read: true },
    { text: 'Audit T1 consulté par le partenaire', time: 'il y a 2j', read: true },
  ];

  const recentPartners = [
    { initials: 'TG', name: 'Total Gabon', type: 'Client', docs: 8, status: 'Actif' },
    { initials: 'SS', name: 'Sogea-Satom', type: 'Sous-traitant', docs: 3, status: 'Actif' },
    { initials: 'BM', name: 'Bolloré Matériaux', type: 'Fournisseur', docs: 12, status: 'Actif' },
  ];

  return (
    <DashboardLayout userInitials={userInitials} pageTitle="Vue d'ensemble">

      {/* ROW 1 — 4 métriques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {metrics.map((m, i) => (
          <div key={i} className="rounded-[10px] p-5" style={m.style}>
            <div className="text-[28px] font-medium" style={m.valStyle}>{m.val}</div>
            <div className="text-[12px] mt-1" style={{ color: m.style.background === 'var(--navy)' ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)' }}>
              {m.label}
            </div>
            <div className="text-[11px] mt-3 pt-2" style={m.subStyle}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ROW 2 — Activité + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">

        {/* Activité (2/3) */}
        <div className="lg:col-span-2 rounded-[12px] p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>Activité récente</div>
            <Link href="/dashboard/partners" className="text-[12px] transition-colors" style={{ color: 'var(--gold)' }}>Voir tout →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 360 }}>
              <thead>
                <tr style={{ background: 'var(--bg-dash)' }}>
                  {['Partenaire', 'Action', 'Date', 'Statut'].map(h => (
                    <th key={h} className="text-left text-[11px] font-medium py-2 px-3 first:rounded-l-[6px] last:rounded-r-[6px]" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activity.map((a, i) => (
                  <tr key={i} className="dash-table-row" style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td className="py-3 px-3 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{a.partner}</td>
                    <td className="py-3 px-3 text-[12px]" style={{ color: 'var(--text-secondary)' }}>{a.action} · {a.doc}</td>
                    <td className="py-3 px-3 text-[12px]" style={{ color: 'var(--text-muted)' }}>{"Aujourd'hui"}</td>
                    <td className="py-3 px-3">
                      <span className={`badge ${a.statusClass}`}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications (1/3) */}
        <div className="rounded-[12px] p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-[14px] font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Notifications</div>
          <div className="flex flex-col">
            {notifications.map((n, i) => (
              <div key={i} className="flex gap-3 py-3" style={{ borderBottom: i < notifications.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.read ? 'var(--border)' : 'var(--gold)' }} />
                <div>
                  <div className="text-[12px] leading-[1.5]" style={{ color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.text}</div>
                  <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 3 — Partenaires récents */}
      <div className="rounded-[12px] p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>Partenaires récents</div>
          <Link href="/dashboard/partners" className="text-[12px]" style={{ color: 'var(--gold)' }}>Voir tous →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {recentPartners.map((p, i) => (
            <Link key={i} href={`/dashboard/partners/${i + 1}`}
              className="rounded-[8px] p-4 block transition-all card-hover"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-dash)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-medium mb-3"
                style={{ background: 'var(--navy)', color: 'var(--gold)' }}>
                {p.initials}
              </div>
              <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{p.type}</div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{p.docs} docs</span>
                <span className="badge badge-green">{p.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </DashboardLayout>
  );
}