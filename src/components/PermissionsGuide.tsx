import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  BookOpen,
  Shield,
  Users,
  LockKey,
  Info,
  CheckCircle,
  WarningCircle,
} from '@phosphor-icons/react';
import { PERMISSION_CATEGORIES, PERMISSION_DESCRIPTIONS } from '@/types/permissions';

export function PermissionsGuide() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" weight="fill" />
              <CardTitle className="font-display text-2xl uppercase tracking-wide">
                How Permissions Work
              </CardTitle>
            </div>
            <CardDescription>
              Complete guide to the roles and permissions system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" weight="fill" />
                    <h3 className="font-display text-lg uppercase">Overview</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The permissions system allows you to control what different users can
                    see and do within the application. Permissions are grouped into
                    <strong> roles</strong>, which can be assigned to users to grant them
                    specific access levels.
                  </p>
                </section>

                <Separator />

                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" weight="fill" />
                    <h3 className="font-display text-lg uppercase">Roles</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A role is a collection of permissions that defines what a user can do.
                    Instead of assigning permissions one-by-one to each user, you create
                    roles with specific permission sets and assign those roles to users.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" weight="fill" />
                      <p className="text-sm">
                        <strong>System Roles:</strong> Pre-configured roles that cannot be
                        deleted (Administrator, Manager, Betting Manager, Viewer)
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" weight="fill" />
                      <p className="text-sm">
                        <strong>Custom Roles:</strong> Roles you create to fit your
                        specific needs
                      </p>
                    </div>
                  </div>
                </section>

                <Separator />

                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <LockKey className="w-5 h-5 text-primary" weight="fill" />
                    <h3 className="font-display text-lg uppercase">Permissions</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Permissions are specific actions or views that can be allowed or
                    restricted. They are organized into categories based on system
                    functionality.
                  </p>
                </section>

                <Separator />

                <section className="space-y-3">
                  <h3 className="font-display text-lg uppercase">Permission Categories</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {Object.entries(PERMISSION_CATEGORIES).map(([key, category]) => (
                      <AccordionItem key={key} value={key}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-semibold">{category.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {category.permissions.length} permissions
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            <p className="text-sm text-muted-foreground">
                              {category.description}
                            </p>
                            <div className="space-y-2">
                              {category.permissions.map((permission) => (
                                <div
                                  key={permission}
                                  className="bg-muted/30 rounded p-3 space-y-1"
                                >
                                  <div className="font-medium text-sm">
                                    {permission
                                      .split('_')
                                      .map(
                                        (word) =>
                                          word.charAt(0).toUpperCase() + word.slice(1)
                                      )
                                      .join(' ')}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {PERMISSION_DESCRIPTIONS[permission]}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>

                <Separator />

                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" weight="fill" />
                    <h3 className="font-display text-lg uppercase">Best Practices</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-primary/10 rounded-lg p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" weight="fill" />
                        <div>
                          <p className="text-sm font-medium">
                            Follow the Principle of Least Privilege
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Only grant users the minimum permissions they need to perform
                            their job functions.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" weight="fill" />
                        <div>
                          <p className="text-sm font-medium">Use Descriptive Role Names</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Name roles clearly to indicate their purpose (e.g., "Event
                            Coordinator" instead of "Role 1").
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" weight="fill" />
                        <div>
                          <p className="text-sm font-medium">
                            Review Permissions Regularly
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Periodically audit roles and permissions to ensure they still
                            match your organizational needs.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-destructive/10 rounded-lg p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <WarningCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" weight="fill" />
                        <div>
                          <p className="text-sm font-medium text-destructive">
                            Protect Administrative Access
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Limit the number of users with full administrative permissions
                            to reduce security risks.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Reference</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">System Roles</h4>
              <div className="space-y-2">
                <div className="bg-muted/50 rounded p-2">
                  <div className="font-medium text-sm">Administrator</div>
                  <p className="text-xs text-muted-foreground">Full system access</p>
                </div>
                <div className="bg-muted/50 rounded p-2">
                  <div className="font-medium text-sm">Manager</div>
                  <p className="text-xs text-muted-foreground">Manage operations</p>
                </div>
                <div className="bg-muted/50 rounded p-2">
                  <div className="font-medium text-sm">Betting Manager</div>
                  <p className="text-xs text-muted-foreground">Handle betting system</p>
                </div>
                <div className="bg-muted/50 rounded p-2">
                  <div className="font-medium text-sm">Viewer</div>
                  <p className="text-xs text-muted-foreground">Read-only access</p>
                </div>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Permission Count</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PERMISSION_CATEGORIES).map(([key, category]) => (
                  <div key={key} className="bg-muted/30 rounded p-2 text-center">
                    <div className="text-lg font-bold text-primary">
                      {category.permissions.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {category.name.split(' ')[0]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you're unsure about which permissions to assign, start with a restrictive
              role and add permissions as needed based on user feedback.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
