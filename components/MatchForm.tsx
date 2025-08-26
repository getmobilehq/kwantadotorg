'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { matchSchema, type MatchForm } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';

interface MatchFormProps {
  onSubmit: (data: MatchForm) => void;
  isLoading?: boolean;
}

export default function MatchForm({ onSubmit, isLoading }: MatchFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MatchForm>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      teamSize: '11',
    },
  });

  const teamSize = watch('teamSize');

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create Your Match</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="title" className="flex items-center space-x-2 mb-2">
              <span>Match Title</span>
            </Label>
            <Input
              {...register('title')}
              placeholder="Sunday League Game"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="flex items-center space-x-2 mb-2">
                <CalendarDays className="w-4 h-4" />
                <span>Date</span>
              </Label>
              <Input
                {...register('date')}
                type="date"
                min={today}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="time" className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4" />
                <span>Time</span>
              </Label>
              <Input
                {...register('time')}
                type="time"
                className={errors.time ? 'border-red-500' : ''}
              />
              {errors.time && (
                <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="location" className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4" />
              <span>Location</span>
            </Label>
            <Input
              {...register('location')}
              placeholder="Central Park Field A"
              className={errors.location ? 'border-red-500' : ''}
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
            )}
          </div>

          <div>
            <Label className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4" />
              <span>Team Size</span>
            </Label>
            <Select value={teamSize} onValueChange={(value) => setValue('teamSize', value as '5' | '7' | '11')}>
              <SelectTrigger className={errors.teamSize ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select team size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 vs 5 (Small field)</SelectItem>
                <SelectItem value="7">7 vs 7 (Medium field)</SelectItem>
                <SelectItem value="11">11 vs 11 (Full field)</SelectItem>
              </SelectContent>
            </Select>
            {errors.teamSize && (
              <p className="text-red-500 text-sm mt-1">{errors.teamSize.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-emerald-500 hover:bg-emerald-600" 
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Next: Set Up Teams'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}