import { useEffect } from 'react';
import axios from 'axios';

interface TrackerProps {
  username: string;
  platform: string;
  task: string;
  active: boolean;
}

export const useBehaviorTracker = ({ username, platform, task, active }: TrackerProps) => {
  useEffect(() => {
    if (!active) return;

    let buffer: any[] = [];

    const log = (type: string, data: any) => {
      buffer.push({
        type,
        data,
        time: Date.now()
      });
    };

    const handleClick = (e: MouseEvent) => log('click', { x: e.clientX, y: e.clientY });
    const handleMove = (e: MouseEvent) => log('move', { x: e.clientX, y: e.clientY });
    const handleKey = (e: KeyboardEvent) => log('key', { key: e.key });

    const sendData = () => {
      if (buffer.length === 0) return;
      axios.post('/api/track', {
        user: username,
        platform,
        task,
        events: [...buffer],
        time: Date.now()
      }).catch(console.error);
      buffer = [];
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('keydown', handleKey);
    const interval = setInterval(sendData, 5000);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('keydown', handleKey);
      clearInterval(interval);
      sendData();
    };
  }, [active, username, platform, task]);
};
