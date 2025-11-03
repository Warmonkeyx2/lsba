import { useState } from "react";
import { Plus, Eye, PencilSimple, Trash, Copy } from "@phosphor-icons/react";
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
import type { Role, Permission } from "@/types/permissions";
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
            Role Management
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

      <div className="grid grid-cols-1 gap-6">
        {systemRoles.length > 0 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-xl uppercase text-foreground tracking-wide">
                System Roles
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Built-in roles with predefined permissions
              </p>
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

        {customRoles.length > 0 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-xl uppercase text-foreground tracking-wide">
                Custom Roles
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                User-created roles tailored to your needs
              </p>
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
        )}

        {customRoles.length === 0 && (
          <Card className="bg-card border border-border p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">No custom roles yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a custom role to define specific permissions for your team
                </p>
                <Button onClick={() => setCreatingRole(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Role
                </Button>
              </div>
            </div>
          </Card>
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
    <Card className="bg-card border border-border p-6 hover:border-primary/50 transition-colors group">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: role.color }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{role.name}</h3>
              {role.isSystemRole && (
                <Badge variant="secondary" className="text-xs mt-1">
                  System
                </Badge>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {role.description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {role.permissions.length} {role.permissions.length === 1 ? 'permission' : 'permissions'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1"
          >
            <PencilSimple className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDuplicate}
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          {!role.isSystemRole && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
