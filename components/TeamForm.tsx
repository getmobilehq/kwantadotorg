'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { teamSchema, type TeamForm } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface TeamFormProps {
  onSubmit: (data: TeamForm) => void;
  matchDetails?: {
    title: string;
    teamSize: string;
  };
  isLoading?: boolean;
}

export default function TeamForm({ onSubmit, matchDetails, isLoading }: TeamFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamForm>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      teamA: '',
      teamB: '',
    },
  });

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {matchDetails && (
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="font-semibold text-emerald-800">{matchDetails.title}</h2>
              <p className="text-sm text-emerald-600">{matchDetails.teamSize} vs {matchDetails.teamSize}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Set Up Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="teamA" className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Team A Name</span>
              </Label>
              <Input
                {...register('teamA')}
                placeholder="Red Devils"
                className={errors.teamA ? 'border-red-500' : ''}
              />
              {errors.teamA && (
                <p className="text-red-500 text-sm mt-1">{errors.teamA.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="teamB" className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>Team B Name</span>
              </Label>
              <Input
                {...register('teamB')}
                placeholder="Blue Eagles"
                className={errors.teamB ? 'border-red-500' : ''}
              />
              {errors.teamB && (
                <p className="text-red-500 text-sm mt-1">{errors.teamB.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-emerald-500 hover:bg-emerald-600" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Match...' : 'Create Match & View Field'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}