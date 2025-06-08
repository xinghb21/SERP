import { useEffect } from 'react';
import axios from 'axios';

interface TrackerProps {
  username: string;
  platform: string;
  task: string;
  active: boolean;
}

const getComponentLabel = (el: HTMLElement | null): string => {
  while (el) {
    if (el.dataset?.component) return el.dataset.component;
    el = el.parentElement as HTMLElement;
  }
  return '';
};

const throttle = (fn: (...args: any[]) => void, delay: number) => {
  let last = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn(...args);
    }
  };
};

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

    // 鼠标移动（节流）
    const handleMove = throttle((e: MouseEvent) => {
      const target = e.target as HTMLElement;
      log('mousemove', {
        x: e.clientX,
        y: e.clientY,
        scrollY: window.scrollY,
        component: getComponentLabel(target)
      });
    }, 100);

    // 点击事件
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      log('click', {
        x: e.clientX,
        y: e.clientY,
        component: getComponentLabel(target)
      });
    };

    // 键盘事件
    const handleKeydown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      const type = (target as any).type?.toLowerCase();

      const isTextInput =
        tag === 'textarea' ||
        (tag === 'input' && !['password', 'checkbox', 'radio', 'hidden'].includes(type)) ||
        target.isContentEditable;

      if (!isTextInput) return;

      const key = e.key;
      if (['Enter', 'Backspace'].includes(key)) {
        log('key', {
          key,
          component: getComponentLabel(target)
        });
      }
    };

    // 输入事件
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      const tag = target.tagName.toLowerCase();
      const type = (target as any).type?.toLowerCase();

      const isTextInput =
        tag === 'textarea' ||
        (tag === 'input' && !['password', 'checkbox', 'radio', 'hidden'].includes(type)) ||
        target.isContentEditable;

      if (!isTextInput) return;

      log('input', {
        value: target.value?.slice(0, 100),
        component: getComponentLabel(target)
      });
    };

    // 悬浮事件
    let hoverStartTime: number | null = null;
    let hoverTarget: HTMLElement | null = null;
    const HOVER_THRESHOLD = 500;

    const handleMouseEnter = (e: MouseEvent) => {
      hoverStartTime = Date.now();
      hoverTarget = e.target as HTMLElement;
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const now = Date.now();
      if (hoverStartTime && hoverTarget && e.target === hoverTarget) {
        const duration = now - hoverStartTime;
        if (duration >= HOVER_THRESHOLD) {
          log('hover', {
            duration,
            component: getComponentLabel(e.target as HTMLElement)
          });
        }
      }
      hoverStartTime = null;
      hoverTarget = null;
    };

    // 滚动事件（方向 + 计数）
    let scrollCount = 0;
    let maxScrollY = 0;
    let scrollUpCount = 0;
    let scrollDownCount = 0;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? 'down' : currentScrollY < lastScrollY ? 'up' : 'none';

      if (direction === 'down') scrollDownCount++;
      else if (direction === 'up') scrollUpCount++;

      scrollCount++;
      maxScrollY = Math.max(maxScrollY, currentScrollY);
      lastScrollY = currentScrollY;

      log('scroll', {
        scrollY: currentScrollY,
        direction,
        scrollCount,
        scrollUpCount,
        scrollDownCount,
        maxScrollY
      });
    };

    // 数据上报
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

    // 绑定事件
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('input', handleInput);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    window.addEventListener('scroll', handleScroll);

    const interval = setInterval(sendData, 5000);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('input', handleInput);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
      sendData();
    };
  }, [active, username, platform, task]);
};
