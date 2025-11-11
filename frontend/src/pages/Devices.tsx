import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRealtime } from '../hooks/useRealtime';
import MobileLayout from '../components/MobileLayout';
import DeviceCard from '../components/DeviceCard';

async function fetchDevices() {
  const res = await fetch((import.meta.env.VITE_API_URL ?? 'http://localhost:5001') + '/api/devices');
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default function DevicesPage() {
  useRealtime();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['devices'],
    queryFn: fetchDevices,
    refetchOnWindowFocus: false,
    staleTime: 10000,
  });

  if (isError) return (
    <MobileLayout title="Devices">
      <div className="p-4 text-red-600">Error: {(error as Error).message}</div>
    </MobileLayout>
  );

  return (
    <MobileLayout title="Devices">
      {isLoading ? (
        <div>Loading…</div>
      ) : (
        <div className="space-y-3">
          {data?.map((d: any) => (
            <DeviceCard key={d.id ?? d._id} device={d} />
          ))}
        </div>
      )}
    </MobileLayout>
  );
}