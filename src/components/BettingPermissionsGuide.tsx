import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  CurrencyDollar,
  CheckCircle,
  WarningCircle,
  Info,
  Shield,
  ChartLine,
  Eye,
  Lock,
} from '@phosphor-icons/react';

export function BettingPermissionsGuide() {
  const bettingPermissions = [
    {
      permission: 'view_betting',
      icon: Eye,
      name: 'View Betting',
      description: 'Access to view betting pools, odds, and bet history',
      riskLevel: 'low',
      recommended: ['All roles that need betting visibility'],
    },
    {
      permission: 'place_bets',
      icon: CurrencyDollar,
      name: 'Place Bets',
      description: 'Ability to place bets on fights within the system',
      riskLevel: 'medium',
      recommended: ['Betting participants', 'Betting Manager'],
    },
    {
      permission: 'manage_betting_pools',
      icon: Shield,
      name: 'Manage Betting Pools',
      description: 'Create, edit, and close betting pools for fight cards',
      riskLevel: 'high',
      recommended: ['Betting Manager', 'Administrator'],
    },
    {
      permission: 'settle_bets',
      icon: Lock,
      name: 'Settle Bets',
      description: 'Authority to settle bets and distribute payouts after fight results',
      riskLevel: 'high',
      recommended: ['Betting Manager', 'Administrator'],
    },
    {
      permission: 'view_betting_reports',
      icon: ChartLine,
      name: 'View Betting Reports',
      description: 'Access to detailed betting analytics, statistics, and financial reports',
      riskLevel: 'medium',
      recommended: ['Betting Manager', 'Administrator'],
    },
  ];

  const workflows = [
    {
      title: 'Opening a Betting Pool',
      steps: [
        'Manager creates a fight card with confirmed fighters',
        'User with manage_betting_pools creates a betting pool for the card',
        'Users with place_bets can now bet on the fights',
        'Pool closes when the event starts or manager manually closes it',
      ],
      requiredPermissions: ['manage_betting_pools'],
    },
    {
      title: 'Placing a Bet',
      steps: [
        'User views active betting pools (view_betting)',
        'User selects a fight and reviews odds',
        'User places bet amount on chosen fighter (place_bets)',
        'Bet is recorded in the system and user balance is adjusted',
      ],
      requiredPermissions: ['view_betting', 'place_bets'],
    },
    {
      title: 'Settling Bets After Fight',
      steps: [
        'Fight results are declared by authorized user',
        'User with settle_bets reviews the betting pool',
        'System automatically calculates payouts based on settings',
        'User confirms settlement and payouts are distributed',
        'Betting pool is marked as settled',
      ],
      requiredPermissions: ['settle_bets', 'declare_results'],
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CurrencyDollar className="w-5 h-5 text-primary" weight="fill" />
            <CardTitle className="font-display text-2xl uppercase tracking-wide">
              Betting System Permissions
            </CardTitle>
          </div>
          <CardDescription>
            Comprehensive guide to betting-related permissions and workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              <Alert>
                <Info className="w-4 h-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Betting permissions involve financial operations and should be assigned
                  carefully. Always follow responsible gambling practices and local
                  regulations.
                </AlertDescription>
              </Alert>

              <section className="space-y-4">
                <h3 className="font-display text-lg uppercase">Permission Breakdown</h3>
                <div className="space-y-3">
                  {bettingPermissions.map((perm) => {
                    const Icon = perm.icon;
                    return (
                      <Card key={perm.permission}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Icon className="w-5 h-5 text-primary" weight="fill" />
                              </div>
                              <div className="space-y-1">
                                <CardTitle className="text-base">{perm.name}</CardTitle>
                                <CardDescription className="text-xs">
                                  {perm.description}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge
                              variant={
                                perm.riskLevel === 'high'
                                  ? 'destructive'
                                  : perm.riskLevel === 'medium'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="text-xs"
                            >
                              {perm.riskLevel} risk
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-xs text-muted-foreground">
                            <strong>Recommended for:</strong> {perm.recommended.join(', ')}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>

              <Separator />

              <section className="space-y-4">
                <h3 className="font-display text-lg uppercase">Betting Workflows</h3>
                <p className="text-sm text-muted-foreground">
                  Understanding how different permissions work together in common betting
                  operations.
                </p>
                <div className="space-y-4">
                  {workflows.map((workflow, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {index + 1}
                          </div>
                          {workflow.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          {workflow.steps.map((step, stepIndex) => (
                            <div key={stepIndex} className="flex items-start gap-2">
                              <CheckCircle
                                className="w-4 h-4 text-primary flex-shrink-0 mt-0.5"
                                weight="fill"
                              />
                              <p className="text-sm">{step}</p>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2">
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs text-muted-foreground">
                              Required:
                            </span>
                            {workflow.requiredPermissions.map((perm) => (
                              <Badge key={perm} variant="secondary" className="text-xs">
                                {perm}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              <Separator />

              <section className="space-y-4">
                <h3 className="font-display text-lg uppercase">Security Best Practices</h3>
                <div className="space-y-3">
                  <Alert>
                    <Shield className="w-4 h-4" />
                    <AlertTitle>Separation of Duties</AlertTitle>
                    <AlertDescription>
                      Consider separating the ability to create betting pools from the
                      ability to settle them. This provides an additional layer of
                      oversight and reduces the risk of fraud.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-primary/10 rounded-lg p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" weight="fill" />
                      <div>
                        <p className="text-sm font-medium">Audit Trail</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          All betting operations are logged. Review the betting reports
                          regularly to ensure proper handling of funds.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" weight="fill" />
                      <div>
                        <p className="text-sm font-medium">Limit Settlement Access</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Only grant settle_bets permission to highly trusted users, as
                          they control payout distribution.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-destructive/10 rounded-lg p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <WarningCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" weight="fill" />
                      <div>
                        <p className="text-sm font-medium text-destructive">
                          Review Pool Settings
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Users with manage_betting_pools can modify payout percentages and
                          house edges. Monitor these settings to ensure fair play.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <Separator />

              <section className="space-y-4">
                <h3 className="font-display text-lg uppercase">Permission Combinations</h3>
                <div className="space-y-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Betting Participant</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">
                          view_betting
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          place_bets
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Basic betting access for users who want to participate in betting
                        pools.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Betting Operator</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">
                          view_betting
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          manage_betting_pools
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          view_betting_reports
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        For users who manage betting pools but don't settle bets.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Full Betting Manager</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">
                          view_betting
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          place_bets
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          manage_betting_pools
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          settle_bets
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          view_betting_reports
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Complete betting system access for trusted betting managers.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
