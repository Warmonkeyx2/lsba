import { Plus, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ImageUpload } from "@/components/ImageUpload";
import type { FightCard, Bout } from "@/types/fightCard";

interface FightCardEditorProps {
  fightCard: FightCard;
  onChange: (card: FightCard) => void;
}

export function FightCardEditor({ fightCard, onChange }: FightCardEditorProps) {
  const updateMainEvent = (field: keyof Bout, value: string | Bout['fighter1Record']) => {
    onChange({
      ...fightCard,
      mainEvent: { ...fightCard.mainEvent, [field]: value }
    });
  };

  const updateCoMainEvent = (field: keyof Bout, value: string | Bout['fighter1Record']) => {
    if (!fightCard.coMainEvent) {
      onChange({
        ...fightCard,
        coMainEvent: {
          id: `co-main-${Date.now()}`,
          fighter1: '',
          fighter2: '',
          type: 'co-main',
          [field]: value
        }
      });
    } else {
      onChange({
        ...fightCard,
        coMainEvent: { ...fightCard.coMainEvent, [field]: value }
      });
    }
  };

  const removeCoMainEvent = () => {
    onChange({
      ...fightCard,
      coMainEvent: undefined
    });
  };

  const addBout = () => {
    const newBout: Bout = {
      id: `bout-${Date.now()}`,
      fighter1: '',
      fighter2: '',
      type: 'undercard'
    };
    onChange({
      ...fightCard,
      otherBouts: [...fightCard.otherBouts, newBout]
    });
  };

  const updateBout = (index: number, field: keyof Bout, value: string | Bout['fighter1Record']) => {
    const updatedBouts = [...fightCard.otherBouts];
    updatedBouts[index] = { ...updatedBouts[index], [field]: value };
    onChange({
      ...fightCard,
      otherBouts: updatedBouts
    });
  };

  const removeBout = (index: number) => {
    onChange({
      ...fightCard,
      otherBouts: fightCard.otherBouts.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-secondary">Event Details</h2>
        <div className="flex flex-col gap-4">
          <ImageUpload
            id="custom-logo"
            label="Custom LSBA Logo (Optional)"
            value={fightCard.customLogo || ''}
            onChange={(value) => onChange({ ...fightCard, customLogo: value })}
            onClear={() => onChange({ ...fightCard, customLogo: '' })}
            placeholder="https://example.com/logo.png or upload a file"
            helperText="Replace the default LSBA text with your custom logo image"
            maxSizeMB={2}
          />
          <div>
            <Label htmlFor="event-date">Event Date</Label>
            <Input
              id="event-date"
              placeholder="e.g., Saturday, October 26th, 2024"
              value={fightCard.eventDate}
              onChange={(e) => onChange({ ...fightCard, eventDate: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Los Santos Arena"
              value={fightCard.location}
              onChange={(e) => onChange({ ...fightCard, location: e.target.value })}
              className="mt-1"
            />
          </div>
          <ImageUpload
            id="background-image"
            label="Background Image (Optional)"
            value={fightCard.backgroundImage || ''}
            onChange={(value) => onChange({ ...fightCard, backgroundImage: value })}
            onClear={() => onChange({ ...fightCard, backgroundImage: '' })}
            placeholder="https://example.com/image.jpg or upload a file"
            helperText="Add a background image URL or upload a file (works with Imgur, Discord CDN, etc.)"
            maxSizeMB={3}
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge className="bg-primary text-primary-foreground">Main Event</Badge>
          <h2 className="text-xl font-semibold text-secondary">Main Event</h2>
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="main-fighter1">Fighter 1</Label>
              <Input
                id="main-fighter1"
                placeholder="First fighter name"
                value={fightCard.mainEvent.fighter1}
                onChange={(e) => updateMainEvent('fighter1', e.target.value)}
                className="mt-1"
              />
              <div className="mt-3">
                <ImageUpload
                  id="main-fighter1-image"
                  label="Fighter 1 Image (Optional)"
                  value={fightCard.mainEvent.fighter1Image || ''}
                  onChange={(value) => updateMainEvent('fighter1Image', value)}
                  onClear={() => updateMainEvent('fighter1Image', '')}
                  placeholder="URL or upload file"
                  maxSizeMB={1}
                />
              </div>
              <Label className="mt-2 inline-block">Fighter 1 Record (Optional)</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div>
                  <Label htmlFor="main-fighter1-wins" className="text-xs">Wins</Label>
                  <Input
                    id="main-fighter1-wins"
                    placeholder="W"
                    value={fightCard.mainEvent.fighter1Record?.wins || ''}
                    onChange={(e) => {
                      const record = fightCard.mainEvent.fighter1Record || { wins: '', losses: '', knockouts: '' };
                      updateMainEvent('fighter1Record', { ...record, wins: e.target.value });
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="main-fighter1-losses" className="text-xs">Losses</Label>
                  <Input
                    id="main-fighter1-losses"
                    placeholder="L"
                    value={fightCard.mainEvent.fighter1Record?.losses || ''}
                    onChange={(e) => {
                      const record = fightCard.mainEvent.fighter1Record || { wins: '', losses: '', knockouts: '' };
                      updateMainEvent('fighter1Record', { ...record, losses: e.target.value });
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="main-fighter1-knockouts" className="text-xs">KOs</Label>
                  <Input
                    id="main-fighter1-knockouts"
                    placeholder="K"
                    value={fightCard.mainEvent.fighter1Record?.knockouts || ''}
                    onChange={(e) => {
                      const record = fightCard.mainEvent.fighter1Record || { wins: '', losses: '', knockouts: '' };
                      updateMainEvent('fighter1Record', { ...record, knockouts: e.target.value });
                    }}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="main-fighter2">Fighter 2</Label>
              <Input
                id="main-fighter2"
                placeholder="Second fighter name"
                value={fightCard.mainEvent.fighter2}
                onChange={(e) => updateMainEvent('fighter2', e.target.value)}
                className="mt-1"
              />
              <div className="mt-3">
                <ImageUpload
                  id="main-fighter2-image"
                  label="Fighter 2 Image (Optional)"
                  value={fightCard.mainEvent.fighter2Image || ''}
                  onChange={(value) => updateMainEvent('fighter2Image', value)}
                  onClear={() => updateMainEvent('fighter2Image', '')}
                  placeholder="URL or upload file"
                  maxSizeMB={1}
                />
              </div>
              <Label className="mt-2 inline-block">Fighter 2 Record (Optional)</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div>
                  <Label htmlFor="main-fighter2-wins" className="text-xs">Wins</Label>
                  <Input
                    id="main-fighter2-wins"
                    placeholder="W"
                    value={fightCard.mainEvent.fighter2Record?.wins || ''}
                    onChange={(e) => {
                      const record = fightCard.mainEvent.fighter2Record || { wins: '', losses: '', knockouts: '' };
                      updateMainEvent('fighter2Record', { ...record, wins: e.target.value });
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="main-fighter2-losses" className="text-xs">Losses</Label>
                  <Input
                    id="main-fighter2-losses"
                    placeholder="L"
                    value={fightCard.mainEvent.fighter2Record?.losses || ''}
                    onChange={(e) => {
                      const record = fightCard.mainEvent.fighter2Record || { wins: '', losses: '', knockouts: '' };
                      updateMainEvent('fighter2Record', { ...record, losses: e.target.value });
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="main-fighter2-knockouts" className="text-xs">KOs</Label>
                  <Input
                    id="main-fighter2-knockouts"
                    placeholder="K"
                    value={fightCard.mainEvent.fighter2Record?.knockouts || ''}
                    onChange={(e) => {
                      const record = fightCard.mainEvent.fighter2Record || { wins: '', losses: '', knockouts: '' };
                      updateMainEvent('fighter2Record', { ...record, knockouts: e.target.value });
                    }}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="main-title">Title/Stipulation</Label>
            <Input
              id="main-title"
              placeholder="e.g., LSBA Heavyweight Championship"
              value={fightCard.mainEvent.title || ''}
              onChange={(e) => updateMainEvent('title', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-accent text-accent-foreground">Co-Main Event</Badge>
            <h2 className="text-xl font-semibold text-secondary">Co-Main Event</h2>
          </div>
          {fightCard.coMainEvent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={removeCoMainEvent}
              className="text-destructive hover:text-destructive"
            >
              <Trash className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="co-fighter1">Fighter 1</Label>
              <Input
                id="co-fighter1"
                placeholder="First fighter name"
                value={fightCard.coMainEvent?.fighter1 || ''}
                onChange={(e) => updateCoMainEvent('fighter1', e.target.value)}
                className="mt-1"
              />
              <div className="mt-3">
                <ImageUpload
                  id="co-fighter1-image"
                  label="Fighter 1 Image (Optional)"
                  value={fightCard.coMainEvent?.fighter1Image || ''}
                  onChange={(value) => updateCoMainEvent('fighter1Image', value)}
                  onClear={() => updateCoMainEvent('fighter1Image', '')}
                  placeholder="URL or upload file"
                  maxSizeMB={1}
                />
              </div>
              <Label className="mt-2 inline-block text-sm">Fighter 1 Record (Optional)</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div>
                  <Label htmlFor="co-fighter1-wins" className="text-xs">Wins</Label>
                  <Input
                    id="co-fighter1-wins"
                    placeholder="W"
                    value={fightCard.coMainEvent?.fighter1Record?.wins || ''}
                    onChange={(e) => {
                      const record = fightCard.coMainEvent?.fighter1Record || { wins: '', losses: '', knockouts: '' };
                      updateCoMainEvent('fighter1Record', { ...record, wins: e.target.value });
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="co-fighter1-losses" className="text-xs">Losses</Label>
                  <Input
                    id="co-fighter1-losses"
                    placeholder="L"
                    value={fightCard.coMainEvent?.fighter1Record?.losses || ''}
                    onChange={(e) => {
                      const record = fightCard.coMainEvent?.fighter1Record || { wins: '', losses: '', knockouts: '' };
                      updateCoMainEvent('fighter1Record', { ...record, losses: e.target.value });
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="co-fighter1-knockouts" className="text-xs">KOs</Label>
                  <Input
                    id="co-fighter1-knockouts"
                    placeholder="K"
                    value={fightCard.coMainEvent?.fighter1Record?.knockouts || ''}
                    onChange={(e) => {
                      const record = fightCard.coMainEvent?.fighter1Record || { wins: '', losses: '', knockouts: '' };
                      updateCoMainEvent('fighter1Record', { ...record, knockouts: e.target.value });
                    }}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="co-fighter2">Fighter 2</Label>
              <Input
                id="co-fighter2"
                placeholder="Second fighter name"
                value={fightCard.coMainEvent?.fighter2 || ''}
                onChange={(e) => updateCoMainEvent('fighter2', e.target.value)}
                className="mt-1"
              />
              <div className="mt-3">
                <ImageUpload
                  id="co-fighter2-image"
                  label="Fighter 2 Image (Optional)"
                  value={fightCard.coMainEvent?.fighter2Image || ''}
                  onChange={(value) => updateCoMainEvent('fighter2Image', value)}
                  onClear={() => updateCoMainEvent('fighter2Image', '')}
                  placeholder="URL or upload file"
                  maxSizeMB={1}
                />
              </div>
              <Label className="mt-2 inline-block text-sm">Fighter 2 Record (Optional)</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div>
                  <Label htmlFor="co-fighter2-wins" className="text-xs">Wins</Label>
                  <Input
                    id="co-fighter2-wins"
                    placeholder="W"
                    value={fightCard.coMainEvent?.fighter2Record?.wins || ''}
                    onChange={(e) => {
                      const record = fightCard.coMainEvent?.fighter2Record || { wins: '', losses: '', knockouts: '' };
                      updateCoMainEvent('fighter2Record', { ...record, wins: e.target.value });
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="co-fighter2-losses" className="text-xs">Losses</Label>
                  <Input
                    id="co-fighter2-losses"
                    placeholder="L"
                    value={fightCard.coMainEvent?.fighter2Record?.losses || ''}
                    onChange={(e) => {
                      const record = fightCard.coMainEvent?.fighter2Record || { wins: '', losses: '', knockouts: '' };
                      updateCoMainEvent('fighter2Record', { ...record, losses: e.target.value });
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="co-fighter2-knockouts" className="text-xs">KOs</Label>
                  <Input
                    id="co-fighter2-knockouts"
                    placeholder="K"
                    value={fightCard.coMainEvent?.fighter2Record?.knockouts || ''}
                    onChange={(e) => {
                      const record = fightCard.coMainEvent?.fighter2Record || { wins: '', losses: '', knockouts: '' };
                      updateCoMainEvent('fighter2Record', { ...record, knockouts: e.target.value });
                    }}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="co-title">Title/Stipulation (Optional)</Label>
            <Input
              id="co-title"
              placeholder="e.g., Light Heavyweight Title"
              value={fightCard.coMainEvent?.title || ''}
              onChange={(e) => updateCoMainEvent('title', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-secondary">Additional Bouts</h2>
          <Button onClick={addBout} size="sm" variant="secondary">
            <Plus className="w-4 h-4 mr-2" />
            Add Bout
          </Button>
        </div>
        {fightCard.otherBouts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No additional bouts added yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {fightCard.otherBouts.map((bout, index) => (
              <div key={bout.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline">Bout {index + 1}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBout(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`bout-${index}-fighter1`}>Fighter 1</Label>
                      <Input
                        id={`bout-${index}-fighter1`}
                        placeholder="First fighter"
                        value={bout.fighter1}
                        onChange={(e) => updateBout(index, 'fighter1', e.target.value)}
                        className="mt-1"
                      />
                      <div className="mt-2">
                        <ImageUpload
                          id={`bout-${index}-fighter1-image`}
                          label="Image (Optional)"
                          value={bout.fighter1Image || ''}
                          onChange={(value) => updateBout(index, 'fighter1Image', value)}
                          onClear={() => updateBout(index, 'fighter1Image', '')}
                          placeholder="URL or upload"
                          maxSizeMB={1}
                        />
                      </div>
                      <Label className="mt-2 inline-block text-xs">Record (Optional)</Label>
                      <div className="grid grid-cols-3 gap-1 mt-1">
                        <Input
                          placeholder="W"
                          value={bout.fighter1Record?.wins || ''}
                          onChange={(e) => {
                            const record = bout.fighter1Record || { wins: '', losses: '', knockouts: '' };
                            updateBout(index, 'fighter1Record', { ...record, wins: e.target.value });
                          }}
                        />
                        <Input
                          placeholder="L"
                          value={bout.fighter1Record?.losses || ''}
                          onChange={(e) => {
                            const record = bout.fighter1Record || { wins: '', losses: '', knockouts: '' };
                            updateBout(index, 'fighter1Record', { ...record, losses: e.target.value });
                          }}
                        />
                        <Input
                          placeholder="K"
                          value={bout.fighter1Record?.knockouts || ''}
                          onChange={(e) => {
                            const record = bout.fighter1Record || { wins: '', losses: '', knockouts: '' };
                            updateBout(index, 'fighter1Record', { ...record, knockouts: e.target.value });
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`bout-${index}-fighter2`}>Fighter 2</Label>
                      <Input
                        id={`bout-${index}-fighter2`}
                        placeholder="Second fighter"
                        value={bout.fighter2}
                        onChange={(e) => updateBout(index, 'fighter2', e.target.value)}
                        className="mt-1"
                      />
                      <div className="mt-2">
                        <ImageUpload
                          id={`bout-${index}-fighter2-image`}
                          label="Image (Optional)"
                          value={bout.fighter2Image || ''}
                          onChange={(value) => updateBout(index, 'fighter2Image', value)}
                          onClear={() => updateBout(index, 'fighter2Image', '')}
                          placeholder="URL or upload"
                          maxSizeMB={1}
                        />
                      </div>
                      <Label className="mt-2 inline-block text-xs">Record (Optional)</Label>
                      <div className="grid grid-cols-3 gap-1 mt-1">
                        <Input
                          placeholder="W"
                          value={bout.fighter2Record?.wins || ''}
                          onChange={(e) => {
                            const record = bout.fighter2Record || { wins: '', losses: '', knockouts: '' };
                            updateBout(index, 'fighter2Record', { ...record, wins: e.target.value });
                          }}
                        />
                        <Input
                          placeholder="L"
                          value={bout.fighter2Record?.losses || ''}
                          onChange={(e) => {
                            const record = bout.fighter2Record || { wins: '', losses: '', knockouts: '' };
                            updateBout(index, 'fighter2Record', { ...record, losses: e.target.value });
                          }}
                        />
                        <Input
                          placeholder="K"
                          value={bout.fighter2Record?.knockouts || ''}
                          onChange={(e) => {
                            const record = bout.fighter2Record || { wins: '', losses: '', knockouts: '' };
                            updateBout(index, 'fighter2Record', { ...record, knockouts: e.target.value });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`bout-${index}-title`}>Title/Description (Optional)</Label>
                    <Input
                      id={`bout-${index}-title`}
                      placeholder="e.g., Rising Stars Showcase"
                      value={bout.title || ''}
                      onChange={(e) => updateBout(index, 'title', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-secondary">Sponsors</h2>
        <div>
          <Label htmlFor="sponsors">Sponsor Names</Label>
          <Textarea
            id="sponsors"
            placeholder="Enter sponsor names separated by commas&#10;e.g., Los Santos Auto, Burger Shot, Ammunation"
            value={fightCard.sponsors}
            onChange={(e) => onChange({ ...fightCard, sponsors: e.target.value })}
            className="mt-1 min-h-[100px]"
          />
        </div>
      </Card>
    </div>
  );
}
