import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { initSocket } from '../lib/socket';

export function useRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    const socket = initSocket();

    const handler = (payload: any) => {
      qc.invalidateQueries({ queryKey: ['devices'] });
      if (payload?.deviceId) qc.invalidateQueries({ queryKey: ['device', payload.deviceId] });
    };

    socket.on('device:telemetry', handler);

    return () => {
      socket.off('device:telemetry', handler);
    };
  }, [qc]);
}