import { useState } from "react";
import { ArrowLeft, PencilSimple, Check, X, Info, Eye } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Role, Permission } from "@/types/permissions";
import { PERMISSION_CATEGORIES, PERMISSION_DESCRIPTIONS } from "@/types/permissions";
import { RolePreviewApp } from "@/components/RolePreviewApp";

interface RoleViewerProps {
  role: Role;
  onBack: () => void;
  onEdit: () => void;
}

export function RoleViewer({ role, onBack, onEdit }: RoleViewerProps) {
  const [activeView, setActiveView] = useState<"preview" | "permissions">("preview");
  const permissionSet = new Set(role.permissions);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full flex-shrink-0"
              style={{ backgroundColor: role.color }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-3xl uppercase text-secondary tracking-wide">
                  {role.name}
                </h2>
                {role.isSystemRole && (
                  <Badge variant="secondary" className="text-xs">
                    System Role
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                {role.description}
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={onEdit}
          size="lg"
          className="bg-primary hover:bg-primary/90"
        >
          <PencilSimple className="w-5 h-5 mr-2" />
          Edit Role
        </Button>
      </div>

      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Live Preview
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-6">
          <Card className="bg-card border-2 border-primary/30 p-1 overflow-hidden">
            <div className="bg-muted/30 rounded-sm overflow-auto max-h-[70vh]">
              <div className="scale-90 origin-top-left" style={{ width: "111.11%" }}>
                <RolePreviewApp role={role} />
              </div>
            </div>
          </Card>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 border border-border rounded-lg p-4">
            <Info className="w-4 h-4 flex-shrink-0" />
            <p>
              This preview shows the application interface as it would appear to a user with this role. 
              Disabled items indicate missing permissions.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <Card className="bg-card border border-border p-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <h3 className="font-semibold text-lg">Permission Overview</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    View all permissions assigned to this role
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {role.permissions.length}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    Total Permissions
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(PERMISSION_CATEGORIES).map(([key, category]) => {
                  const categoryPermissions = category.permissions;
                  const enabledPermissions = categoryPermissions.filter(p => 
                    permissionSet.has(p)
                  );
                  const allEnabled = enabledPermissions.length === categoryPermissions.length;
                  const someEnabled = enabledPermissions.length > 0;

                  return (
                    <div key={key} className="space-y-3">
                      <div className="flex items-start gap-3 pb-3 border-b border-border">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            allEnabled
                              ? 'bg-primary/20 text-primary'
                              : someEnabled
                              ? 'bg-secondary/20 text-secondary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {someEnabled ? (
                            <Check className="w-4 h-4" weight="bold" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{category.name}</h4>
                            <Badge
                              variant={allEnabled ? "default" : someEnabled ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {enabledPermissions.length}/{categoryPermissions.length}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {category.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-9">
                        {categoryPermissions.map((permission) => {
                          const hasPermission = permissionSet.has(permission);
                          return (
                            <PermissionItem
                              key={permission}
                              permission={permission}
                              enabled={hasPermission}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card className="bg-card border border-border p-6 mt-6">
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-lg">Role Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Role ID
                  </div>
                  <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {role.id}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Created Date
                  </div>
                  <div className="text-sm">
                    {new Date(role.createdDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Role Type
                  </div>
                  <div className="text-sm">
                    {role.isSystemRole ? 'System Role' : 'Custom Role'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface PermissionItemProps {
  permission: Permission;
  enabled: boolean;
}

function PermissionItem({ permission, enabled }: PermissionItemProps) {
  const description = PERMISSION_DESCRIPTIONS[permission];
  const displayName = permission
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
        enabled
          ? 'bg-primary/5 border-primary/30'
          : 'bg-muted/30 border-border'
      }`}
    >
      <div
        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
          enabled
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {enabled ? (
          <Check className="w-3 h-3" weight="bold" />
        ) : (
          <X className="w-3 h-3" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium ${
              enabled ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            {displayName}
          </span>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                  <Info className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
