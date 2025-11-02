import { useState } from 'react';
import { Trophy, Sparkle, Shuffle, Crown, CheckCircle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import type { Boxer } from '@/types/boxer';
import type { Tournament, TournamentMatch } from '@/types/tournament';
import { 
  createTournamentBracket, 
  generateSeededBracket, 
  generateRandomBracket,
  advanceWinner,
  getRoundName,
  getTop32Boxers
} from '@/lib/tournamentUtils';

interface TournamentBracketProps {
  boxers: Boxer[];
  tournaments: Tournament[];
  onCreateTournament: (tournament: Tournament) => void;
  onUpdateTournament: (tournament: Tournament) => void;
}

export function TournamentBracket({ boxers, tournaments, onCreateTournament, onUpdateTournament }: TournamentBracketProps) {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [tournamentName, setTournamentName] = useState('');
  const [seedingMethod, setSeedingMethod] = useState<'ranked' | 'random'>('ranked');
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);

  const top32 = getTop32Boxers(boxers);
  const canCreateTournament = top32.length === 32;

  const handleCreateTournament = () => {
    if (!tournamentName.trim()) {
      toast.error('Please enter a tournament name');
      return;
    }

    if (!canCreateTournament) {
      toast.error('Need exactly 32 fighters to create a tournament');
      return;
    }

    const participants = seedingMethod === 'ranked' 
      ? generateSeededBracket(boxers)
      : generateRandomBracket(boxers);

    const tournament = createTournamentBracket(participants, seedingMethod, tournamentName);
    onCreateTournament(tournament);
    setSelectedTournament(tournament);
    setShowCreateDialog(false);
    setTournamentName('');
    toast.success('Tournament bracket created!');
  };

  const handleDeclareWinner = (matchId: string, winnerId: string) => {
    if (!selectedTournament) return;

    const updatedTournament = advanceWinner(selectedTournament, matchId, winnerId);
    onUpdateTournament(updatedTournament);
    setSelectedTournament(updatedTournament);
    setShowMatchDialog(false);
    setSelectedMatch(null);
    
    if (updatedTournament.status === 'completed') {
      const champion = boxers.find(b => b.id === updatedTournament.champion);
      toast.success(`Tournament Complete! ${champion?.firstName} ${champion?.lastName} is the Champion! 🏆`);
    } else {
      toast.success('Winner declared! Bracket updated.');
    }
  };

  const getBoxerById = (id?: string) => {
    if (!id) return null;
    return boxers.find(b => b.id === id);
  };

  const openMatchDialog = (match: TournamentMatch) => {
    if (match.status === 'completed') {
      toast.info('This match has already been completed');
      return;
    }
    if (!match.fighter1Id || !match.fighter2Id) {
      toast.info('Waiting for previous matches to complete');
      return;
    }
    setSelectedMatch(match);
    setShowMatchDialog(true);
  };

  const renderMatch = (match: TournamentMatch) => {
    const fighter1 = getBoxerById(match.fighter1Id);
    const fighter2 = getBoxerById(match.fighter2Id);
    const winner = match.winnerId ? getBoxerById(match.winnerId) : null;

    return (
      <Card
        key={match.id}
        className={`p-3 cursor-pointer transition-all hover:border-primary ${
          match.status === 'completed' ? 'bg-muted/30' : 'hover:bg-card/80'
        }`}
        onClick={() => openMatchDialog(match)}
      >
        <div className="flex flex-col gap-2">
          <div className={`flex items-center justify-between p-2 rounded ${
            match.winnerId === fighter1?.id ? 'bg-primary/20 border border-primary/40' : 'bg-muted/50'
          }`}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {match.fighter1Seed && (
                <Badge variant="outline" className="text-xs shrink-0">#{match.fighter1Seed}</Badge>
              )}
              {fighter1 ? (
                <>
                  <Avatar className="w-6 h-6 shrink-0">
                    <AvatarImage src={fighter1.profileImage} />
                    <AvatarFallback className="text-xs">
                      {fighter1.firstName[0]}{fighter1.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">
                    {fighter1.firstName} {fighter1.lastName}
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">TBD</span>
              )}
            </div>
            {match.winnerId === fighter1?.id && (
              <CheckCircle className="w-4 h-4 text-primary shrink-0" weight="fill" />
            )}
          </div>

          <div className={`flex items-center justify-between p-2 rounded ${
            match.winnerId === fighter2?.id ? 'bg-primary/20 border border-primary/40' : 'bg-muted/50'
          }`}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {match.fighter2Seed && (
                <Badge variant="outline" className="text-xs shrink-0">#{match.fighter2Seed}</Badge>
              )}
              {fighter2 ? (
                <>
                  <Avatar className="w-6 h-6 shrink-0">
                    <AvatarImage src={fighter2.profileImage} />
                    <AvatarFallback className="text-xs">
                      {fighter2.firstName[0]}{fighter2.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">
                    {fighter2.firstName} {fighter2.lastName}
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">TBD</span>
              )}
            </div>
            {match.winnerId === fighter2?.id && (
              <CheckCircle className="w-4 h-4 text-primary shrink-0" weight="fill" />
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderRound = (roundNumber: number) => {
    if (!selectedTournament) return null;

    const roundMatches = selectedTournament.matches.filter(m => m.round === roundNumber);
    
    return (
      <div className="flex flex-col gap-3 min-w-[220px]">
        <div className="text-center">
          <h3 className="font-display text-lg uppercase text-secondary tracking-wide">
            {getRoundName(roundNumber)}
          </h3>
          <p className="text-xs text-muted-foreground">
            {roundMatches.filter(m => m.status === 'completed').length}/{roundMatches.length} Complete
          </p>
        </div>
        <div className={`flex flex-col ${roundNumber === 1 ? 'gap-3' : 'gap-6'}`}>
          {roundMatches.map(match => renderMatch(match))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl uppercase text-secondary tracking-wide">
            Championship Tournament
          </h2>
          <p className="text-muted-foreground mt-1">
            Single elimination bracket for top 32 fighters
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          disabled={!canCreateTournament}
          size="lg"
          className="bg-primary hover:bg-primary/90"
        >
          <Trophy className="w-5 h-5 mr-2" />
          Create New Tournament
        </Button>
      </div>

      {!canCreateTournament && (
        <Card className="p-4 border-accent/30 bg-accent/5">
          <p className="text-sm text-muted-foreground text-center">
            You need exactly 32 ranked fighters to create a tournament. Current: {top32.length}/32
          </p>
        </Card>
      )}

      {tournaments.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="font-display text-xl uppercase text-secondary tracking-wide">
            Tournament History
          </h3>
          <div className="flex flex-wrap gap-2">
            {tournaments.map(tournament => {
              const champion = tournament.champion ? getBoxerById(tournament.champion) : null;
              return (
                <Button
                  key={tournament.id}
                  variant={selectedTournament?.id === tournament.id ? 'default' : 'outline'}
                  onClick={() => setSelectedTournament(tournament)}
                  className="flex items-center gap-2"
                >
                  {tournament.status === 'completed' && <Crown className="w-4 h-4 text-accent" weight="fill" />}
                  {tournament.name}
                  {champion && <span className="text-xs">({champion.firstName} {champion.lastName})</span>}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {selectedTournament && (
        <Card className="p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-2xl uppercase text-secondary tracking-wide">
                  {selectedTournament.name}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant={selectedTournament.status === 'completed' ? 'default' : 'outline'}>
                    {selectedTournament.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {selectedTournament.seedingMethod === 'ranked' ? 'Ranked Seeding' : 'Random Seeding'}
                  </span>
                </div>
              </div>
              {selectedTournament.champion && (
                <div className="flex items-center gap-3 bg-accent/10 border border-accent/30 rounded-lg px-4 py-2">
                  <Crown className="w-6 h-6 text-accent" weight="fill" />
                  <div>
                    <p className="text-xs text-muted-foreground">Champion</p>
                    <p className="font-display text-lg text-accent">
                      {getBoxerById(selectedTournament.champion)?.firstName} {getBoxerById(selectedTournament.champion)?.lastName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <ScrollArea className="w-full">
            <div className="flex gap-6 pb-4">
              {[1, 2, 3, 4, 5].map(round => renderRound(round))}
            </div>
          </ScrollArea>
        </Card>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase">Create Tournament</DialogTitle>
            <DialogDescription>
              Generate a single-elimination bracket for the top 32 ranked fighters
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div>
              <Label htmlFor="tournament-name">Tournament Name *</Label>
              <Input
                id="tournament-name"
                placeholder="e.g., Championship 2024"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Seeding Method</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant={seedingMethod === 'ranked' ? 'default' : 'outline'}
                  onClick={() => setSeedingMethod('ranked')}
                  className="flex-1 flex items-center gap-2"
                >
                  <Sparkle className="w-4 h-4" />
                  Ranked Seeding
                </Button>
                <Button
                  type="button"
                  variant={seedingMethod === 'random' ? 'default' : 'outline'}
                  onClick={() => setSeedingMethod('random')}
                  className="flex-1 flex items-center gap-2"
                >
                  <Shuffle className="w-4 h-4" />
                  Random
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {seedingMethod === 'ranked' 
                  ? 'Traditional seeding: #1 vs #32, #2 vs #31, etc. Balances bracket for competitive fairness.'
                  : 'Random matchups: All fighters randomly placed for unpredictable excitement.'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTournament}>
              <Trophy className="w-4 h-4 mr-2" />
              Create Bracket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase">Declare Winner</DialogTitle>
            <DialogDescription>
              Select the winner to advance to the next round
            </DialogDescription>
          </DialogHeader>

          {selectedMatch && (
            <div className="flex flex-col gap-4 py-4">
              {[selectedMatch.fighter1Id, selectedMatch.fighter2Id].map((fighterId) => {
                const fighter = getBoxerById(fighterId);
                if (!fighter) return null;

                return (
                  <Button
                    key={fighterId}
                    variant="outline"
                    onClick={() => handleDeclareWinner(selectedMatch.id, fighterId!)}
                    className="h-auto p-4 justify-start hover:bg-primary/10 hover:border-primary"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={fighter.profileImage} />
                        <AvatarFallback>
                          {fighter.firstName[0]}{fighter.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-display text-lg">
                          {fighter.firstName} {fighter.lastName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{fighter.wins}W-{fighter.losses}L-{fighter.knockouts}KO</span>
                          <span>•</span>
                          <span>{fighter.rankingPoints} pts</span>
                        </div>
                      </div>
                      <Trophy className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </Button>
                );
              })}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMatchDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
