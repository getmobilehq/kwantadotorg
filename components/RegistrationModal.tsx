'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registrationSchema, type RegistrationForm } from '@/lib/validations';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone } from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RegistrationForm) => void;
  teamName: string;
  teamColor: 'emerald' | 'blue';
  isLoading?: boolean;
}

export default function RegistrationModal({
  isOpen,
  onClose,
  onSubmit,
  teamName,
  teamColor,
  isLoading
}: RegistrationModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
  });

  const handleFormSubmit = (data: RegistrationForm) => {
    onSubmit(data);
    reset();
  };

  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200'
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Join <span className={`px-2 py-1 rounded text-sm ${colorClasses[teamColor]}`}>
              {teamName}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name" className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4" />
              <span>Full Name</span>
            </Label>
            <Input
              {...register('name')}
              placeholder="John Doe"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center space-x-2 mb-2">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </Label>
            <Input
              {...register('email')}
              type="email"
              placeholder="john@example.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone" className="flex items-center space-x-2 mb-2">
              <Phone className="w-4 h-4" />
              <span>Phone (if no email)</span>
            </Label>
            <Input
              {...register('phone')}
              type="tel"
              placeholder="+1 (555) 123-4567"
              className={errors.phone ? 'border-red-500' : ''}
            />
          </div>

          <p className="text-sm text-gray-600">
            Please provide either an email or phone number so we can contact you about match updates.
          </p>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`flex-1 ${
                teamColor === 'emerald' 
                  ? 'bg-emerald-500 hover:bg-emerald-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Joining...' : 'Join Team'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}