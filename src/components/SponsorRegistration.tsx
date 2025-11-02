import { useState } from 'react';
import { Plus, Briefcase } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import type { Sponsor } from '@/types/boxer';

interface SponsorRegistrationProps {
  onRegister: (sponsor: Sponsor) => void;
}

export function SponsorRegistration({ onRegister }: SponsorRegistrationProps) {
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phoneNumber: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.contactPerson || !formData.email || !formData.phoneNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newSponsor: Sponsor = {
      id: `sponsor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      registeredDate: new Date().toISOString(),
      boxersSponsored: [],
    };

    onRegister(newSponsor);
    toast.success(`${formData.name} registered successfully!`);
    
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phoneNumber: '',
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="w-7 h-7 text-accent" weight="bold" />
        <h2 className="text-2xl font-display uppercase text-accent">Register New Sponsor</h2>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="sponsor-name">Sponsor Name *</Label>
          <Input
            id="sponsor-name"
            placeholder="Company or Organization Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact-person">Contact Person *</Label>
            <Input
              id="contact-person"
              placeholder="Full Name"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="sponsor-email">Email Address *</Label>
            <Input
              id="sponsor-email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="sponsor-phone">Phone Number *</Label>
          <Input
            id="sponsor-phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            required
            className="mt-1"
          />
        </div>

        <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground mt-2">
          <Plus className="w-5 h-5 mr-2" />
          Register Sponsor
        </Button>
      </form>
    </Card>
  );
}
