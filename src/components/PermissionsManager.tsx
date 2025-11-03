import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, PencilSimple, Trash, Info, Shield, Eye, LockKey } from '@phosphor-icons/react';
import { toast } from 'sonner';
import type {
  Role,
  Permission,
} from '@/types/permissions';
import {
  PERMISSION_CATEGORIES,
  PERMISSION_DESCRIPTIONS,
} from '@/types/permissions';
import { useRole } from '@/lib/roleContext';

interface PermissionsManagerProps {
  roles: Role[];
  onCreateRole: (role: Role) => void;
  onUpdateRole: (role: Role) => void;
  onDeleteRole: (roleId: string) => void;
}

export function PermissionsManager({
  roles,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
}: PermissionsManagerProps) {
  const { setPreviewRole } = useRole();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'oklch(0.70 0.15 220)',
    permissions: [] as Permission[],
  });

  const handleCreateNew = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      color: 'oklch(0.70 0.15 220)',
      permissions: [],
    });
    setDialogOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      color: role.color,
      permissions: role.permissions,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a role name');
      return;
    }

    const roleData: Role = {
      id: editingRole?.id || `role-${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description.trim(),
      color: formData.color,
      permissions: formData.permissions,
      createdDate: editingRole?.createdDate || new Date().toISOString(),
      isSystemRole: editingRole?.isSystemRole || false,
    };

    if (editingRole) {
      onUpdateRole(roleData);
      toast.success('Role updated successfully');
    } else {
      onCreateRole(roleData);
      toast.success('Role created successfully');
    }

    setDialogOpen(false);
  };

  const handleDelete = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (role?.isSystemRole) {
      toast.error('Cannot delete system roles');
      return;
    }
    onDeleteRole(roleId);
    toast.success('Role deleted successfully');
  };

  const togglePermission = (permission: Permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const toggleCategoryPermissions = (categoryPermissions: Permission[]) => {
    const allSelected = categoryPermissions.every((p) =>
      formData.permissions.includes(p)
    );
    
    if (allSelected) {
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter(
          (p) => !categoryPermissions.includes(p)
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: [
          ...prev.permissions,
          ...categoryPermissions.filter((p) => !prev.permissions.includes(p)),
        ],
      }));
    }
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" weight="fill" />
                <CardTitle className="font-display text-2xl uppercase tracking-wide">
                  Roles & Permissions
                </CardTitle>
              </div>
              <CardDescription>
                Manage user roles and control access to system features
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreateNew} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl uppercase">
                    {editingRole ? 'Edit Role' : 'Create New Role'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure role details and assign permissions
                  </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role-name">Role Name</Label>
                        <Input
                          id="role-name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="e.g., Event Coordinator"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role-color">Role Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="role-color"
                            value={formData.color}
                            onChange={(e) =>
                              setFormData({ ...formData, color: e.target.value })
                            }
                            placeholder="oklch(0.70 0.15 220)"
                          />
                          <div
                            className="w-10 h-10 rounded border border-border"
                            style={{ backgroundColor: formData.color }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role-description">Description</Label>
                      <Textarea
                        id="role-description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Describe what this role can do..."
                        rows={2}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <LockKey className="w-5 h-5 text-primary" weight="fill" />
                        <h4 className="font-display text-lg uppercase">Permissions</h4>
                      </div>

                      {Object.entries(PERMISSION_CATEGORIES).map(
                        ([key, category]) => {
                          const allSelected = category.permissions.every((p) =>
                            formData.permissions.includes(p)
                          );
                          const someSelected = category.permissions.some((p) =>
                            formData.permissions.includes(p)
                          );

                          return (
                            <Card key={key}>
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      checked={allSelected}
                                      onCheckedChange={() =>
                                        toggleCategoryPermissions(category.permissions)
                                      }
                                      className={
                                        someSelected && !allSelected
                                          ? 'data-[state=checked]:bg-primary/50'
                                          : ''
                                      }
                                    />
                                    <div>
                                      <CardTitle className="text-base">
                                        {category.name}
                                      </CardTitle>
                                      <CardDescription className="text-xs">
                                        {category.description}
                                      </CardDescription>
                                    </div>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {
                                      category.permissions.filter((p) =>
                                        formData.permissions.includes(p)
                                      ).length
                                    }
                                    /{category.permissions.length}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="grid grid-cols-1 gap-2">
                                  {category.permissions.map((permission) => (
                                    <div
                                      key={permission}
                                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                                    >
                                      <div className="flex items-center gap-2 flex-1">
                                        <Checkbox
                                          checked={formData.permissions.includes(
                                            permission
                                          )}
                                          onCheckedChange={() =>
                                            togglePermission(permission)
                                          }
                                        />
                                        <Label
                                          className="cursor-pointer text-sm flex-1"
                                          onClick={() => togglePermission(permission)}
                                        >
                                          {permission
                                            .split('_')
                                            .map(
                                              (word) =>
                                                word.charAt(0).toUpperCase() +
                                                word.slice(1)
                                            )
                                            .join(' ')}
                                        </Label>
                                      </div>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                          <p className="text-xs">
                                            {PERMISSION_DESCRIPTIONS[permission]}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        }
                      )}
                    </div>
                  </div>
                </ScrollArea>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    {editingRole ? 'Update Role' : 'Create Role'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <Card key={role.id} className="relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: role.color }}
                />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {role.name}
                        {role.isSystemRole && (
                          <Badge variant="secondary" className="text-xs">
                            System
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {role.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      <span>{role.permissions.length} permissions</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPreviewRole(role);
                          toast.success(`Now previewing as: ${role.name}`);
                        }}
                        className="flex-1 gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View as Role
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(role)}
                        className="flex-1 gap-2"
                      >
                        <PencilSimple className="w-4 h-4" />
                        Edit
                      </Button>
                      {!role.isSystemRole && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(role.id)}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
