import { useMemo } from 'react';
import { useRequests } from './useRequests';
import { useShows } from './useShows';
import type {
  AccreditationRequest,
  AccreditationStatus,
} from '@/types/database';

export interface DashboardStats {
  totalRequests: number;
  approvalRate: number;
  pendingCount: number;
  upcomingDeadlines: AccreditationRequest[];
  recentActivity: AccreditationRequest[];
  byStatus: Record<AccreditationStatus, number>;
  byMonth: {
    month: string;
    granted: number;
    rejected: number;
    submitted: number;
  }[];
  topContacts: {
    name: string;
    company: string | null;
    granted: number;
    total: number;
  }[];
}

export function useDashboardStats(): {
  stats: DashboardStats | null;
  isLoading: boolean;
} {
  const { data: requests = [], isLoading: rLoading } = useRequests();
  const { isLoading: sLoading } = useShows();

  const stats = useMemo<DashboardStats | null>(() => {
    if (rLoading || sLoading) return null;

    // --- by status ---
    const byStatus = requests.reduce(
      (acc, r) => {
        acc[r.status] = (acc[r.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<AccreditationStatus, number>,
    );

    // --- approval rate ---
    const decided = (byStatus.granted ?? 0) + (byStatus.rejected ?? 0);
    const approvalRate =
      decided > 0 ? Math.round(((byStatus.granted ?? 0) / decided) * 100) : 0;

    // --- pending ---
    const TERMINAL: AccreditationStatus[] = [
      'granted',
      'rejected',
      'shot',
      'no_show',
    ];
    const pendingCount = requests.filter(
      (r) => !TERMINAL.includes(r.status),
    ).length;

    // --- upcoming deadlines (next 7 days) ---
    const now = new Date();
    const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingDeadlines = requests
      .filter((r) => {
        if (!r.submission_deadline) return false;
        if (
          ['submitted', 'granted', 'rejected', 'shot', 'no_show'].includes(
            r.status,
          )
        )
          return false;
        const d = new Date(r.submission_deadline);
        return d >= now && d <= in7days;
      })
      .sort(
        (a, b) =>
          new Date(a.submission_deadline!).getTime() -
          new Date(b.submission_deadline!).getTime(),
      )
      .slice(0, 5);

    // --- recent activity ---
    const recentActivity = [...requests]
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )
      .slice(0, 8);

    // --- by month (last 6 months) ---
    const monthMap: Record<
      string,
      { granted: number; rejected: number; submitted: number }
    > = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const key = d.toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      });
      monthMap[key] = { granted: 0, rejected: 0, submitted: 0 };
    }

    requests.forEach((r) => {
      const d = new Date(r.updated_at);
      if (d < sixMonthsAgo) return;
      const key = d.toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      });
      if (!monthMap[key]) return;
      if (r.status === 'granted') monthMap[key].granted++;
      if (r.status === 'rejected') monthMap[key].rejected++;
      if (['submitted', 'awaiting_response'].includes(r.status))
        monthMap[key].submitted++;
    });

    const byMonth = Object.entries(monthMap).map(([month, counts]) => ({
      month,
      ...counts,
    }));

    // --- top contacts ---
    const contactMap: Record<
      string,
      {
        name: string;
        company: string | null;
        granted: number;
        total: number;
      }
    > = {};

    requests.forEach((r) => {
      if (!r.pr_contact) return;
      const id = r.pr_contact.id;
      if (!contactMap[id]) {
        contactMap[id] = {
          name: r.pr_contact.name,
          company: r.pr_contact.company ?? null,
          granted: 0,
          total: 0,
        };
      }
      contactMap[id].total++;
      if (r.status === 'granted' || r.status === 'shot')
        contactMap[id].granted++;
    });

    const topContacts = Object.values(contactMap)
      .filter((c) => c.total >= 1)
      .sort((a, b) => b.granted / b.total - a.granted / a.total)
      .slice(0, 5);

    return {
      totalRequests: requests.length,
      approvalRate,
      pendingCount,
      upcomingDeadlines,
      recentActivity,
      byStatus,
      byMonth,
      topContacts,
    };
  }, [requests, rLoading, sLoading]);

  return {
    isLoading: rLoading || sLoading,
    stats,
  };
}
