import { useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import type { Boxer } from '@/types/boxer';

interface BoxerRegistrationProps {
  onRegister: (boxer: Boxer) => void;
}

export function BoxerRegistration({ onRegister }: BoxerRegistrationProps) {
  const [formData, setFormData] = useState({
    stateId: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    sponsor: '',
    profileImage: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.stateId || !formData.firstName || !formData.lastName || !formData.phoneNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newBoxer: Boxer = {
      id: `boxer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      stateId: formData.stateId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      sponsor: formData.sponsor,
      wins: 0,
      losses: 0,
      knockouts: 0,
      registeredDate: new Date().toISOString(),
      profileImage: formData.profileImage || undefined,
      fightHistory: [],
    };

    onRegister(newBoxer);
    toast.success(`${formData.firstName} ${formData.lastName} registered successfully!`);
    
    setFormData({
      stateId: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      sponsor: '',
      profileImage: '',
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-display uppercase text-secondary mb-6">Register New Boxer</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="state-id">State ID *</Label>
            <Input
              id="state-id"
              placeholder="State ID Number"
              value={formData.stateId}
              onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              required
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first-name">First Name *</Label>
            <Input
              id="first-name"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="last-name">Last Name *</Label>
            <Input
              id="last-name"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="sponsor">Sponsor</Label>
          <Input
            id="sponsor"
            placeholder="Sponsor Name (Optional)"
            value={formData.sponsor}
            onChange={(e) => setFormData({ ...formData, sponsor: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="profile-image">Profile Image URL</Label>
          <Input
            id="profile-image"
            placeholder="https://example.com/photo.jpg (Optional)"
            value={formData.profileImage}
            onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
            className="mt-1"
          />
        </div>

        <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 mt-2">
          <Plus className="w-5 h-5 mr-2" />
          Register Boxer
        </Button>
      </form>
    </Card>
  );
}
