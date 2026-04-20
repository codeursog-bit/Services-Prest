'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatDate } from '@/lib/utils';

interface Notif {
  id:        string;
  content:   string;
  isRead:    boolean;
  type:      string;
  link:      string | null;
  createdAt: string;
  partner:   { id: string; orgName: string } | null;
}

const TYPE_ICON: Record<string, JSX.Element> = {
  INFO: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  ALERT: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  WARNING: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B2335" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

const TYPE_BG: Record<string, string> = {
  INFO:    'bg-[#E8EEF5]',
  ALERT:   'bg-[#FEF3E2]',
  WARNING: 'bg-[#FCEBEB]',
};

export default function NotificationsPage() {
  const [notifs, setNotifs]       = useState<Notif[]>([]);
  const [unreadCount, setUnread]  = useState(0);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<'all' | 'unread'>('all');
  const [isPending, startT]       = useTransition();

  const load = () => {
    fetch('/api/notifications?limit=100')
      .then(r => r.json())
      .then(d => {
        setNotifs(d.notifications || []);
        setUnread(d.unreadCount  || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = (id: string) => {
    startT(async () => {
      await fetch(`/api/notifications/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    });
  };

  const handleMarkAllRead = () => {
    startT(async () => {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    });
  };

  const handleDelete = (id: string) => {
    startT(async () => {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setNotifs(prev => prev.filter(n => n.id !== id));
    });
  };

  const displayed = filter === 'unread'
    ? notifs.filter(n => !n.isRead)
    : notifs;

  return (
    <DashboardLayout pageTitle="Notifications">

      {/* BARRE ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[12px] mb-[24px]">
        <div className="flex gap-[6px]">
          {[
            { id: 'all',    label: `Toutes (${notifs.length})` },
            { id: 'unread', label: `Non lues (${unreadCount})` },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id as any)}
              className={`py-[6px] px-[12px] rounded-[6px] text-[12px] border transition-colors ${
                filter === f.id
                  ? 'bg-[#1A3A5C] border-[#1A3A5C] text-[#FFFFFF]'
                  : 'bg-[#FFFFFF] border-[#E8E7E4] text-[#6B6A67] hover:border-[#1A3A5C]'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="text-[12px] text-[#1A3A5C] hover:underline disabled:opacity-50"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* LISTE */}
      <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] overflow-hidden">
        {loading ? (
          <div className="p-[48px] text-center text-[13px] text-[#6B6A67]">Chargement…</div>
        ) : displayed.length === 0 ? (
          <div className="p-[48px] text-center">
            <svg className="mx-auto mb-[12px]" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E8E7E4" strokeWidth="1.2" strokeLinecap="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <p className="text-[13px] text-[#6B6A67]">
              {filter === 'unread' ? 'Aucune notification non lue.' : 'Aucune notification.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E7E4]">
            {displayed.map(notif => (
              <div key={notif.id}
                className={`flex items-start gap-[14px] p-[14px_20px] hover:bg-[#F7F7F6] transition-colors ${
                  !notif.isRead ? 'bg-[rgba(26,58,92,0.02)]' : ''
                }`}>

                {/* Icône type */}
                <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 mt-[2px] ${
                  TYPE_BG[notif.type] || TYPE_BG.INFO
                }`}>
                  {TYPE_ICON[notif.type] || TYPE_ICON.INFO}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] leading-[1.5] ${notif.isRead ? 'text-[#6B6A67]' : 'text-[#1A1A19] font-medium'}`}>
                    {notif.content}
                  </p>
                  <div className="flex flex-wrap items-center gap-[8px] mt-[4px]">
                    <span className="text-[11px] text-[#6B6A67]">{formatDate(notif.createdAt)}</span>
                    {notif.partner && (
                      <>
                        <span className="text-[#E8E7E4]">·</span>
                        <Link
                          href={`/dashboard/partners/${notif.partner.id}`}
                          className="text-[11px] text-[#1A3A5C] hover:underline"
                        >
                          {notif.partner.orgName}
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-[6px] items-end flex-shrink-0">
                  {/* Point non lu */}
                  {!notif.isRead && (
                    <div className="w-[7px] h-[7px] rounded-full bg-[#1A3A5C]"></div>
                  )}
                  {notif.link && (
                    <Link href={notif.link}
                      onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                      className="text-[11px] text-[#1A3A5C] hover:underline whitespace-nowrap">
                      Voir →
                    </Link>
                  )}
                  {!notif.isRead && (
                    <button onClick={() => handleMarkRead(notif.id)} disabled={isPending}
                      className="text-[11px] text-[#6B6A67] hover:text-[#1A1A19] hover:underline disabled:opacity-50 whitespace-nowrap">
                      Marquer lu
                    </button>
                  )}
                  <button onClick={() => handleDelete(notif.id)} disabled={isPending}
                    className="text-[11px] text-[#9B2335] hover:underline disabled:opacity-50">
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
