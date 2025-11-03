import { useState } from "react";
import { ArrowLeft, FloppyDisk, Info } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Role, Permission } from "@/types/permissions";
import { PERMISSION_CATEGORIES, PERMISSION_DESCRIPTIONS } from "@/types/permissions";

interface RoleEditorProps {
  role?: Role;
  onSave: (role: Role) => void;
  onCancel: () => void;
}

const PRESET_COLORS = [
  { name: "Red", value: "oklch(0.55 0.22 25)" },
  { name: "Orange", value: "oklch(0.70 0.20 50)" },
  { name: "Yellow", value: "oklch(0.85 0.18 90)" },
  { name: "Green", value: "oklch(0.65 0.20 145)" },
  { name: "Cyan", value: "oklch(0.70 0.15 200)" },
  { name: "Blue", value: "oklch(0.55 0.15 250)" },
  { name: "Purple", value: "oklch(0.60 0.20 290)" },
  { name: "Pink", value: "oklch(0.70 0.20 340)" },
];

export function RoleEditor({ role, onSave, onCancel }: RoleEditorProps) {
  const [name, setName] = useState(role?.name || "");
  const [description, setDescription] = useState(role?.description || "");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<Permission>>(
    new Set(role?.permissions || [])
  );
  const [color, setColor] = useState(role?.color || PRESET_COLORS[0].value);

  const handleTogglePermission = (permission: Permission) => {
    const newPermissions = new Set(selectedPermissions);
    if (newPermissions.has(permission)) {
      newPermissions.delete(permission);
    } else {
      newPermissions.add(permission);
    }
    setSelectedPermissions(newPermissions);
  };

  const handleToggleCategory = (categoryPermissions: Permission[]) => {
    const allSelected = categoryPermissions.every(p => selectedPermissions.has(p));
    const newPermissions = new Set(selectedPermissions);
    
    categoryPermissions.forEach(permission => {
      if (allSelected) {
        newPermissions.delete(permission);
      } else {
        newPermissions.add(permission);
      }
    });
    
    setSelectedPermissions(newPermissions);
  };

  const handleSave = () => {
    if (!name.trim()) {
      return;
    }

    const savedRole: Role = {
      id: role?.id || `role-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      permissions: Array.from(selectedPermissions),
      color,
      createdDate: role?.createdDate || new Date().toISOString(),
      isSystemRole: role?.isSystemRole || false,
    };

    onSave(savedRole);
  };

  const canSave = name.trim().length > 0 && selectedPermissions.size > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h2 className="font-display text-3xl uppercase text-secondary tracking-wide">
            {role ? 'Edit Role' : 'Create New Role'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {role ? 'Modify role details and permissions' : 'Define a new role with custom permissions'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="bg-card border border-border p-6 sticky top-6">
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Role Details</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role-name">Role Name *</Label>
                    <Input
                      id="role-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Event Coordinator"
                      maxLength={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role-description">Description</Label>
                    <Textarea
                      id="role-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the purpose of this role..."
                      rows={4}
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground">
                      {description.length}/200 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Role Color</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {PRESET_COLORS.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => setColor(preset.value)}
                          className={`w-full aspect-square rounded-lg border-2 transition-all ${
                            color === preset.value
                              ? 'border-foreground scale-110'
                              : 'border-border hover:border-foreground/50'
                          }`}
                          style={{ backgroundColor: preset.value }}
                          title={preset.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Permissions Selected</span>
                  <span className="text-sm text-muted-foreground">
                    {selectedPermissions.size}
                  </span>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={!canSave}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <FloppyDisk className="w-4 h-4 mr-2" />
                  {role ? 'Save Changes' : 'Create Role'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-card border border-border p-6">
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Permissions</h3>
                <p className="text-sm text-muted-foreground">
                  Select the permissions this role should have. Hover over the info icon for details.
                </p>
              </div>

              <div className="space-y-6">
                {Object.entries(PERMISSION_CATEGORIES).map(([key, category]) => {
                  const categoryPermissions = category.permissions;
                  const selectedCount = categoryPermissions.filter(p => 
                    selectedPermissions.has(p)
                  ).length;
                  const allSelected = selectedCount === categoryPermissions.length;
                  const someSelected = selectedCount > 0 && !allSelected;

                  return (
                    <div key={key} className="space-y-3">
                      <div className="flex items-start gap-3 pb-2 border-b border-border">
                        <Checkbox
                          id={`category-${key}`}
                          checked={allSelected}
                          className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
                          onCheckedChange={() => handleToggleCategory(categoryPermissions)}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={`category-${key}`}
                            className="font-semibold cursor-pointer flex items-center gap-2"
                          >
                            {category.name}
                            <span className="text-xs text-muted-foreground font-normal">
                              ({selectedCount}/{categoryPermissions.length})
                            </span>
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {category.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 ml-8">
                        {categoryPermissions.map((permission) => (
                          <PermissionCheckbox
                            key={permission}
                            permission={permission}
                            checked={selectedPermissions.has(permission)}
                            onToggle={() => handleTogglePermission(permission)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface PermissionCheckboxProps {
  permission: Permission;
  checked: boolean;
  onToggle: () => void;
}

function PermissionCheckbox({ permission, checked, onToggle }: PermissionCheckboxProps) {
  const description = PERMISSION_DESCRIPTIONS[permission];
  const displayName = permission
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="flex items-start gap-3 group">
      <Checkbox
        id={permission}
        checked={checked}
        onCheckedChange={onToggle}
        className="mt-1"
      />
      <div className="flex-1 flex items-center gap-2">
        <label
          htmlFor={permission}
          className="text-sm font-medium cursor-pointer group-hover:text-primary transition-colors"
        >
          {displayName}
        </label>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="text-sm">{description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
