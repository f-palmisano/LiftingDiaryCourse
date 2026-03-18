'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function DatePickerNav({ selectedDate }: { selectedDate: Date }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    router.push(`/dashboard?date=${format(date, 'yyyy-MM-dd')}`);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <Button variant="outline" className="w-48 justify-start gap-2 text-left font-normal">
          <CalendarIcon className="size-4 text-muted-foreground" />
          {format(selectedDate, 'do MMM yyyy')}
        </Button>
      } />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
