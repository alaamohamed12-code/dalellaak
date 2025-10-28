// Header Types
export interface UserType {
  id?: number;
  username: string;
  image?: string;
  accountType?: 'user' | 'company';
  email?: string;
}

export interface OtherParty {
  firstName: string;
  lastName: string;
  username: string;
  type: 'user' | 'company' | 'support';
  image: string | null;
}

export interface Conversation {
  id: string | number;
  type: 'conversation' | 'support';
  ticketId?: number;
  subject?: string;
  lastBody?: string;
  lastAt: string;
  status?: 'open' | 'answered' | 'closed';
  unreadCount: number;
  userId?: number;
  companyId?: number;
  otherParty: OtherParty;
}

export interface HeaderProps {
  navOnlyHome?: boolean;
}

export interface NavItem {
  id: string;
  label: string;
}
