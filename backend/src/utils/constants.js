const ROLES = {
  SUPER_ADMIN: 'superAdmin',
  CLUB_MANAGER: 'clubManager',
  MATCH_MANAGER: 'matchManager',
  USER: 'user',
};

const MATCH_STATUS = {
  UNSCHEDULED: 'unscheduled',
  UPCOMING: 'upcoming',
  LIVE: 'live',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
};

const TOURNAMENT_TYPE = {
  CLUB: 'club',
  KNOCKOUT: 'knockout',
};

const TOURNAMENT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

const PLAYER_ROLE = {
  BATSMAN: 'batsman',
  BOWLER: 'bowler',
  ALLROUNDER: 'allrounder',
  WICKETKEEPER: 'wicketkeeper',
};

const WICKET_TYPES = [
  'bowled',
  'caught',
  'lbw',
  'runout',
  'stumped',
  'hitwicket',
  'retired',
];

const EXTRA_TYPES = ['wide', 'noball', 'bye', 'legbye', 'penalty'];

const EVENT_TYPES = ['normal', 'wide', 'noball', 'bye', 'legbye', 'wicket', 'penalty'];

const AUDIT_ACTIONS = [
  'match_started',
  'score_added',
  'wicket_added',
  'extra_added',
  'undo',
  'inning_switch',
  'match_ended',
  'match_resumed',
];

module.exports = {
  ROLES,
  MATCH_STATUS,
  TOURNAMENT_TYPE,
  TOURNAMENT_STATUS,
  PLAYER_ROLE,
  WICKET_TYPES,
  EXTRA_TYPES,
  EVENT_TYPES,
  AUDIT_ACTIONS,
};
