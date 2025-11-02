import { useState } from 'react';
import { Plus, Briefcase } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import type { Sponsor } from '@/types/boxer';
import { ImageUpload } from '@/components/ImageUpload';

interface SponsorRegistrationProps {
  onRegister: (sponsor: Sponsor) => void;
  existingSponsors: Sponsor[];
}

export function SponsorRegistration({ onRegister, existingSponsors }: SponsorRegistrationProps) {
  const [formData, setFormData] = useState({
    stateId: '',
    name: '',
    contactPerson: '',
    phoneNumber: '',
    logoUrl: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.stateId || !formData.name || !formData.contactPerson || !formData.phoneNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    const duplicateStateId = existingSponsors.find(
      (sponsor) => sponsor.stateId.toLowerCase() === formData.stateId.toLowerCase()
    );

    if (duplicateStateId) {
      toast.error(`State ID ${formData.stateId} is already registered to ${duplicateStateId.name}`);
      return;
    }

    const duplicateName = existingSponsors.find(
      (sponsor) => sponsor.name.toLowerCase() === formData.name.toLowerCase()
    );

    if (duplicateName) {
      toast.error(`Sponsor "${formData.name}" is already registered`);
      return;
    }

    const newSponsor: Sponsor = {
      id: `sponsor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      stateId: formData.stateId,
      name: formData.name,
      contactPerson: formData.contactPerson,
      phoneNumber: formData.phoneNumber,
      registeredDate: new Date().toISOString(),
      boxersSponsored: [],
      logoUrl: formData.logoUrl || undefined,
      additionalContacts: [],
    };

    onRegister(newSponsor);
    toast.success(`${formData.name} registered successfully!`);
    
    setFormData({
      stateId: '',
      name: '',
      contactPerson: '',
      phoneNumber: '',
      logoUrl: '',
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
          <Label htmlFor="sponsor-state-id">State ID *</Label>
          <Input
            id="sponsor-state-id"
            placeholder="Enter State ID"
            value={formData.stateId}
            onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
            required
            className="mt-1"
          />
        </div>

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
        </div>

        <div>
          <Label htmlFor="sponsor-logo">Sponsor Logo URL</Label>
          <Input
            id="sponsor-logo"
            placeholder="https://example.com/logo.png (Optional)"
            value={formData.logoUrl}
            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            className="mt-1"
          />
          {formData.logoUrl && (
            <div className="mt-2 p-4 border border-border rounded-md bg-card">
              <p className="text-xs text-muted-foreground mb-2">Logo Preview:</p>
              <img 
                src={formData.logoUrl} 
                alt="Sponsor logo preview" 
                className="max-h-24 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground mt-2">
          <Plus className="w-5 h-5 mr-2" />
          Register Sponsor
        </Button>
      </form>
    </Card>
  );
}
