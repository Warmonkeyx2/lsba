import { useState } from "react";
import { Plus, Eye, PencilSimple, Trash, Copy, ShieldCheck } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RoleEditor } from "@/components/RoleEditor";
import { RoleViewer } from "@/components/RoleViewer";
import type { Role } from "@/types/permissions";
import { toast } from "sonner";

interface RoleManagerProps {
  roles: Role[];
  onCreateRole: (role: Role) => void;
  onUpdateRole: (role: Role) => void;
  onDeleteRole: (roleId: string) => void;
}

export function RoleManager({ roles, onCreateRole, onUpdateRole, onDeleteRole }: RoleManagerProps) {
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [creatingRole, setCreatingRole] = useState(false);

  const handleCreateRole = (role: Role) => {
    onCreateRole(role);
    setCreatingRole(false);
    toast.success(`Role "${role.name}" created successfully!`);
  };

  const handleUpdateRole = (role: Role) => {
    onUpdateRole(role);
    setEditingRole(null);
    toast.success(`Role "${role.name}" updated successfully!`);
  };

  const handleDeleteRole = () => {
    if (deletingRole) {
      onDeleteRole(deletingRole.id);
      setDeletingRole(null);
      toast.success(`Role "${deletingRole.name}" deleted successfully!`);
    }
  };

  const handleDuplicateRole = (role: Role) => {
    const duplicatedRole: Role = {
      ...role,
      id: `role-${Date.now()}`,
      name: `${role.name} (Copy)`,
      isSystemRole: false,
      createdDate: new Date().toISOString(),
    };
    onCreateRole(duplicatedRole);
    toast.success(`Role "${duplicatedRole.name}" created successfully!`);
  };

  if (creatingRole) {
    return (
      <RoleEditor
        onSave={handleCreateRole}
        onCancel={() => setCreatingRole(false)}
      />
    );
  }

  if (editingRole) {
    return (
      <RoleEditor
        role={editingRole}
        onSave={handleUpdateRole}
        onCancel={() => setEditingRole(null)}
      />
    );
  }

  if (viewingRole) {
    return (
      <RoleViewer
        role={viewingRole}
        onBack={() => setViewingRole(null)}
        onEdit={() => {
          setViewingRole(null);
          setEditingRole(viewingRole);
        }}
      />
    );
  }

  const systemRoles = roles.filter(r => r.isSystemRole);
  const customRoles = roles.filter(r => !r.isSystemRole);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl uppercase text-secondary tracking-wide">
            Roles & Permissions
          </h2>
          <p className="text-muted-foreground mt-1">
            Create and manage user roles with custom permissions
          </p>
        </div>
        <Button
          onClick={() => setCreatingRole(true)}
          size="lg"
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {systemRoles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" weight="bold" />
              </div>
              <div>
                <h3 className="font-display text-xl uppercase text-foreground tracking-wide">
                  System Roles
                </h3>
                <p className="text-sm text-muted-foreground">
                  Built-in roles with predefined permissions
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onView={() => setViewingRole(role)}
                  onEdit={() => setEditingRole(role)}
                  onDelete={() => setDeletingRole(role)}
                  onDuplicate={() => handleDuplicateRole(role)}
                />
              ))}
            </div>
          </div>
        )}

        {customRoles.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-secondary" weight="bold" />
              </div>
              <div>
                <h3 className="font-display text-xl uppercase text-foreground tracking-wide">
                  Custom Roles
                </h3>
                <p className="text-sm text-muted-foreground">
                  User-created roles tailored to your needs
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onView={() => setViewingRole(role)}
                  onEdit={() => setEditingRole(role)}
                  onDelete={() => setDeletingRole(role)}
                  onDuplicate={() => handleDuplicateRole(role)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-secondary" weight="bold" />
              </div>
              <div>
                <h3 className="font-display text-xl uppercase text-foreground tracking-wide">
                  Custom Roles
                </h3>
                <p className="text-sm text-muted-foreground">
                  User-created roles tailored to your needs
                </p>
              </div>
            </div>
            <Card className="bg-card border border-dashed border-border p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">No custom roles yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a custom role to define specific permissions for your team
                  </p>
                  <Button onClick={() => setCreatingRole(true)} size="lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Role
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <AlertDialog open={!!deletingRole} onOpenChange={() => setDeletingRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{deletingRole?.name}"? This action cannot
              be undone. Users with this role will lose their permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface RoleCardProps {
  role: Role;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function RoleCard({ role, onView, onEdit, onDelete, onDuplicate }: RoleCardProps) {
  return (
    <Card className="bg-card border border-border hover:border-primary/50 transition-all duration-200 group overflow-hidden">
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="w-12 h-12 rounded-lg flex-shrink-0 shadow-sm transition-transform group-hover:scale-110 duration-200"
              style={{ backgroundColor: role.color }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate mb-1">{role.name}</h3>
              <div className="flex items-center gap-2">
                {role.isSystemRole && (
                  <Badge variant="secondary" className="text-xs">
                    System
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {role.permissions.length} permissions
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {role.description}
        </p>

        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="w-full justify-start"
          >
            <Eye className="w-4 h-4 mr-2" />
            View & Preview
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="justify-start"
            >
              <PencilSimple className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              className="justify-start"
            >
              <Copy className="w-4 h-4 mr-2" />
              Clone
            </Button>
          </div>
          
          {!role.isSystemRole && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete Role
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
