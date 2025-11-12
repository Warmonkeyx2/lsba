import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CountdownTimerProps {
  targetDate: string;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function CountdownTimer({ targetDate, className = '' }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  const calculateTimeRemaining = (target: string): TimeRemaining => {
    const targetTime = new Date(target).getTime();
    const currentTime = new Date().getTime();
    const timeDiff = targetTime - currentTime;

    if (timeDiff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
      };
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      isExpired: false,
    };
  };

  useEffect(() => {
    const updateTimer = () => {
      setTimeRemaining(calculateTimeRemaining(targetDate));
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const formatTimeUnit = (unit: number): string => {
    return unit.toString().padStart(2, '0');
  };

  const getTimeStatus = (): { variant: 'default' | 'destructive' | 'secondary' | 'outline', text: string } => {
    if (timeRemaining.isExpired) {
      return { variant: 'destructive', text: 'EXPIRED' };
    }

    if (timeRemaining.days === 0 && timeRemaining.hours <= 1) {
      return { variant: 'destructive', text: 'IMMINENT' };
    }

    if (timeRemaining.days === 0 && timeRemaining.hours <= 24) {
      return { variant: 'secondary', text: 'TODAY' };
    }

    if (timeRemaining.days <= 1) {
      return { variant: 'secondary', text: 'TOMORROW' };
    }

    if (timeRemaining.days <= 7) {
      return { variant: 'outline', text: 'THIS WEEK' };
    }

    return { variant: 'default', text: 'UPCOMING' };
  };

  const timeStatus = getTimeStatus();

  if (timeRemaining.isExpired) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Clock className="w-4 h-4 text-destructive" />
        <Badge variant="destructive" className="animate-pulse">
          EVENT EXPIRED
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Clock className="w-4 h-4 text-muted-foreground" />
      
      <div className="flex items-center gap-2">
        <Badge variant={timeStatus.variant} className="text-xs">
          {timeStatus.text}
        </Badge>
        
        <div className="flex items-center gap-1 text-sm font-mono">
          {timeRemaining.days > 0 && (
            <>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-primary">
                  {formatTimeUnit(timeRemaining.days)}
                </span>
                <span className="text-xs text-muted-foreground">
                  DAY{timeRemaining.days !== 1 ? 'S' : ''}
                </span>
              </div>
              <span className="text-muted-foreground mx-1">:</span>
            </>
          )}
          
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-primary">
              {formatTimeUnit(timeRemaining.hours)}
            </span>
            <span className="text-xs text-muted-foreground">HRS</span>
          </div>
          
          <span className="text-muted-foreground mx-1">:</span>
          
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-primary">
              {formatTimeUnit(timeRemaining.minutes)}
            </span>
            <span className="text-xs text-muted-foreground">MIN</span>
          </div>
          
          <span className="text-muted-foreground mx-1">:</span>
          
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-accent animate-pulse">
              {formatTimeUnit(timeRemaining.seconds)}
            </span>
            <span className="text-xs text-muted-foreground">SEC</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for compact countdown (for smaller spaces)
export function CompactCountdownTimer({ targetDate, className = '' }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  const calculateTimeRemaining = (target: string): TimeRemaining => {
    const targetTime = new Date(target).getTime();
    const currentTime = new Date().getTime();
    const timeDiff = targetTime - currentTime;

    if (timeDiff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
      };
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      isExpired: false,
    };
  };

  useEffect(() => {
    const updateTimer = () => {
      setTimeRemaining(calculateTimeRemaining(targetDate));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeRemaining.isExpired) {
    return (
      <Badge variant="destructive" className={`text-xs animate-pulse ${className}`}>
        EXPIRED
      </Badge>
    );
  }

  const formatCompactTime = (): string => {
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m`;
    }
    if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s`;
    }
    return `${timeRemaining.minutes}m ${timeRemaining.seconds}s`;
  };

  const getCompactStatus = () => {
    if (timeRemaining.days === 0 && timeRemaining.hours <= 1) {
      return 'destructive';
    }
    if (timeRemaining.days === 0) {
      return 'secondary';
    }
    return 'outline';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="w-3 h-3" />
      <Badge variant={getCompactStatus()} className="text-xs font-mono">
        {formatCompactTime()}
      </Badge>
    </div>
  );
}