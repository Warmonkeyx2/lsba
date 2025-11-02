import { useState } from 'react';
import { ArrowLeft, UserPlus, Trash, PencilSimple, Plus, Image } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import type { Sponsor, SponsorContact, Boxer } from '@/types/boxer';

interface SponsorProfileProps {
  sponsor: Sponsor;
  boxers: Boxer[];
  onBack: () => void;
  onUpdateSponsor: (sponsor: Sponsor) => void;
}

export function SponsorProfile({ sponsor, boxers, onBack, onUpdateSponsor }: SponsorProfileProps) {
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isEditingLogo, setIsEditingLogo] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phoneNumber: '',
    role: '',
  });
  const [logoUrl, setLogoUrl] = useState(sponsor.logoUrl || '');

  const sponsoredBoxers = boxers.filter(boxer => 
    sponsor.boxersSponsored.includes(boxer.id)
  );

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phoneNumber) {
      toast.error('Please fill in name and phone number');
      return;
    }

    const contact: SponsorContact = {
      id: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newContact.name,
      phoneNumber: newContact.phoneNumber,
      role: newContact.role || undefined,
    };

    const updatedSponsor = {
      ...sponsor,
      additionalContacts: [...sponsor.additionalContacts, contact],
    };

    onUpdateSponsor(updatedSponsor);
    toast.success('Contact added successfully!');
    setNewContact({ name: '', phoneNumber: '', role: '' });
    setIsAddingContact(false);
  };

  const handleDeleteContact = (contactId: string) => {
    const updatedSponsor = {
      ...sponsor,
      additionalContacts: sponsor.additionalContacts.filter(c => c.id !== contactId),
    };

    onUpdateSponsor(updatedSponsor);
    toast.success('Contact removed');
  };

  const handleUpdateLogo = () => {
    const updatedSponsor = {
      ...sponsor,
      logoUrl: logoUrl || undefined,
    };

    onUpdateSponsor(updatedSponsor);
    toast.success('Logo updated successfully!');
    setIsEditingLogo(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-display text-4xl uppercase text-secondary tracking-wide">
            {sponsor.name}
          </h1>
          <p className="text-muted-foreground mt-1">Sponsor Profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display uppercase text-secondary">
                Sponsor Details
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              {sponsor.logoUrl ? (
                <div className="relative">
                  <img 
                    src={sponsor.logoUrl} 
                    alt={`${sponsor.name} logo`}
                    className="h-24 w-24 object-contain border border-border rounded-lg p-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <Dialog open={isEditingLogo} onOpenChange={setIsEditingLogo}>
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                      >
                        <PencilSimple className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Sponsor Logo</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col gap-4 pt-4">
                        <div>
                          <Label htmlFor="logo-url">Logo URL</Label>
                          <Input
                            id="logo-url"
                            placeholder="https://example.com/logo.png"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        {logoUrl && (
                          <div className="p-4 border border-border rounded-md bg-card">
                            <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                            <img 
                              src={logoUrl} 
                              alt="Logo preview" 
                              className="max-h-32 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button onClick={handleUpdateLogo} className="flex-1">
                            Update Logo
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditingLogo(false)} className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <Dialog open={isEditingLogo} onOpenChange={setIsEditingLogo}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-24 w-24 flex flex-col gap-2">
                      <Image className="w-8 h-8" />
                      <span className="text-xs">Add Logo</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Sponsor Logo</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 pt-4">
                      <div>
                        <Label htmlFor="logo-url">Logo URL</Label>
                        <Input
                          id="logo-url"
                          placeholder="https://example.com/logo.png"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      {logoUrl && (
                        <div className="p-4 border border-border rounded-md bg-card">
                          <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                          <img 
                            src={logoUrl} 
                            alt="Logo preview" 
                            className="max-h-32 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateLogo} className="flex-1">
                          Add Logo
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditingLogo(false)} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{sponsor.name}</h3>
                <p className="text-sm text-muted-foreground">State ID: {sponsor.stateId}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Primary Contact</p>
                <p className="text-base mt-1">{sponsor.contactPerson}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                <p className="text-base mt-1">{sponsor.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Boxers Sponsored</p>
                <p className="text-base mt-1">{sponsor.boxersSponsored.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Registered</p>
                <p className="text-base mt-1">
                  {new Date(sponsor.registeredDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-display uppercase text-secondary">
              Additional Contacts
            </h3>
            <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Additional Contact</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 pt-4">
                  <div>
                    <Label htmlFor="contact-name">Name *</Label>
                    <Input
                      id="contact-name"
                      placeholder="Full Name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-phone">Phone Number *</Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={newContact.phoneNumber}
                      onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-role">Role</Label>
                    <Input
                      id="contact-role"
                      placeholder="e.g., Manager, Assistant (Optional)"
                      value={newContact.role}
                      onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddContact} className="flex-1">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Contact
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingContact(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {sponsor.additionalContacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No additional contacts yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sponsor.additionalContacts.map((contact) => (
                <div key={contact.id} className="p-3 border border-border rounded-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{contact.name}</p>
                      {contact.role && (
                        <p className="text-xs text-muted-foreground">{contact.role}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">{contact.phoneNumber}</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Contact</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {contact.name} from the contact list?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteContact(contact.id)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-2xl font-display uppercase text-secondary mb-4">
          Sponsored Boxers
        </h3>
        {sponsoredBoxers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No boxers currently sponsored</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sponsoredBoxers.map((boxer) => (
              <div key={boxer.id} className="p-4 border border-border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  {boxer.profileImage ? (
                    <img
                      src={boxer.profileImage}
                      alt={`${boxer.firstName} ${boxer.lastName}`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                      <span className="text-primary font-bold text-lg">
                        {boxer.firstName[0]}{boxer.lastName[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{boxer.firstName} {boxer.lastName}</p>
                    <p className="text-sm text-muted-foreground">
                      {boxer.wins}W - {boxer.losses}L - {boxer.knockouts}KO
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">Ranking Points</p>
                  <p className="text-lg font-bold text-primary">{boxer.rankingPoints}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
