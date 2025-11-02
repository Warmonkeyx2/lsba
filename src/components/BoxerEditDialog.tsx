import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FloppyDisk, X, Plus, Minus } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { Boxer, Sponsor } from "@/types/boxer";

interface BoxerEditDialogProps {
  boxer: Boxer;
  sponsors: Sponsor[];
  onClose: () => void;
  onSave: (boxer: Boxer) => void;
}

export function BoxerEditDialog({ boxer, sponsors, onClose, onSave }: BoxerEditDialogProps) {
  const [formData, setFormData] = useState<Boxer>({ ...boxer });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.stateId.trim()) {
      newErrors.stateId = "State ID is required";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }
    if (formData.wins < 0) {
      newErrors.wins = "Wins cannot be negative";
    }
    if (formData.losses < 0) {
      newErrors.losses = "Losses cannot be negative";
    }
    if (formData.knockouts < 0) {
      newErrors.knockouts = "Knockouts cannot be negative";
    }
    if (formData.knockouts > formData.wins) {
      newErrors.knockouts = "Knockouts cannot exceed total wins";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      toast.success("Fighter profile updated successfully!");
    } else {
      toast.error("Please fix the errors before saving");
    }
  };

  const adjustStat = (field: 'wins' | 'losses' | 'knockouts', delta: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(0, prev[field] + delta),
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase text-secondary">
            Edit Fighter Profile
          </DialogTitle>
          <DialogDescription>
            Update fighter information and statistics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={errors.firstName ? "border-destructive" : ""}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={errors.lastName ? "border-destructive" : ""}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stateId">State ID *</Label>
              <Input
                id="stateId"
                value={formData.stateId}
                onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
                className={errors.stateId ? "border-destructive" : ""}
              />
              {errors.stateId && (
                <p className="text-sm text-destructive">{errors.stateId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className={errors.phoneNumber ? "border-destructive" : ""}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">{errors.phoneNumber}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sponsor">Sponsor</Label>
            <Select
              value={formData.sponsor || "none"}
              onValueChange={(value) => 
                setFormData({ ...formData, sponsor: value === "none" ? "" : value })
              }
            >
              <SelectTrigger id="sponsor">
                <SelectValue placeholder="Select a registered sponsor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Sponsor</SelectItem>
                {sponsors.map((sponsor) => (
                  <SelectItem key={sponsor.id} value={sponsor.name}>
                    {sponsor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Only registered sponsors can be selected
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileImage">Profile Image URL</Label>
            <Input
              id="profileImage"
              value={formData.profileImage || ""}
              onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="border border-border rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-sm uppercase text-muted-foreground">
              Fight Statistics
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wins">Wins</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustStat('wins', -1)}
                    disabled={formData.wins === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    id="wins"
                    type="number"
                    min="0"
                    value={formData.wins}
                    onChange={(e) => setFormData({ ...formData, wins: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustStat('wins', 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {errors.wins && (
                  <p className="text-sm text-destructive">{errors.wins}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="losses">Losses</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustStat('losses', -1)}
                    disabled={formData.losses === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    id="losses"
                    type="number"
                    min="0"
                    value={formData.losses}
                    onChange={(e) => setFormData({ ...formData, losses: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustStat('losses', 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {errors.losses && (
                  <p className="text-sm text-destructive">{errors.losses}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="knockouts">Knockouts</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustStat('knockouts', -1)}
                    disabled={formData.knockouts === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    id="knockouts"
                    type="number"
                    min="0"
                    max={formData.wins}
                    value={formData.knockouts}
                    onChange={(e) => setFormData({ ...formData, knockouts: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustStat('knockouts', 1)}
                    disabled={formData.knockouts >= formData.wins}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {errors.knockouts && (
                  <p className="text-sm text-destructive">{errors.knockouts}</p>
                )}
              </div>
            </div>

            <div className="bg-muted/50 rounded p-3 text-sm">
              <p className="text-muted-foreground">
                Win Rate: <span className="font-semibold text-foreground">
                  {formData.wins + formData.losses === 0 
                    ? '0%' 
                    : `${Math.round((formData.wins / (formData.wins + formData.losses)) * 100)}%`
                  }
                </span>
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            <FloppyDisk className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
