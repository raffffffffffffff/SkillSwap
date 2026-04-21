export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type UserSkillType = 'teach' | 'learn';
export type SwapStatus = 'pending' | 'accepted' | 'declined';
export type SessionStatus = 'planned' | 'completed' | 'cancelled';
export type SessionFormat = 'online' | 'offline';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  city?: string;
  bio?: string;
  rating: number;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  type: UserSkillType;
  level: SkillLevel;
}

export interface SwapRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  offeredSkillId: string;
  wantedSkillId: string;
  status: SwapStatus;
  message?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  requestId: string;
  date: string;
  durationMinutes: number;
  format: SessionFormat;
  status: SessionStatus;
  notes?: string;
}

export interface Review {
  id: string;
  sessionId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment?: string;
}

export interface GroupMaterial {
  id: string;
  groupId: string;
  userId: string;
  title: string;
  url: string;
  createdAt: string;
}

export interface SkillGroup {
  id: string;
  title: string;
  category: string;
  description: string;
  memberIds: string[];
  createdBy: string;
  createdAt: string;
}

export interface Credentials {
  userId: string;
  email: string;
  password: string;
}

export interface SkillSwapDb {
  users: User[];
  credentials: Credentials[];
  skills: Skill[];
  userSkills: UserSkill[];
  swapRequests: SwapRequest[];
  sessions: Session[];
  reviews: Review[];
  groups: SkillGroup[];
  materials: GroupMaterial[];
}

export interface PartnerCard {
  user: User;
  teachSkills: UserSkill[];
  learnSkills: UserSkill[];
  compatibility: number;
}

export interface DashboardMetrics {
  outgoing: number;
  incoming: number;
  acceptedMatches: number;
  plannedSessions: number;
  averageRating: number;
}

export interface DiscoverFilters {
  query: string;
  skillId: string;
  category: string;
  level: SkillLevel | 'all';
  sortBy: 'compatibility' | 'rating' | 'name';
}
