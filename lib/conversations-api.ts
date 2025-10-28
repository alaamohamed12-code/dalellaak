import type { Conversation } from '@/types/header';

interface FetchConversationsParams {
  userId?: number;
  companyId?: number;
  accountType?: 'user' | 'company';
  lang: string;
}

export async function fetchAllConversationsWithDetails({
  userId,
  companyId,
  accountType,
  lang
}: FetchConversationsParams): Promise<{ conversations: Conversation[]; error?: string }> {
  try {
    // Fetch both regular conversations and support tickets in parallel
    const [conversationsRes, supportRes] = await Promise.all([
      fetch(`/api/conversations?${accountType === 'company' ? `companyId=${companyId}` : `userId=${userId}`}`),
      fetch(`/api/support?userId=${userId || companyId}`)
    ]);

    if (!conversationsRes.ok || !supportRes.ok) {
      throw new Error('Failed to fetch conversations');
    }

    const [conversationsData, supportData] = await Promise.all([
      conversationsRes.json(),
      supportRes.json()
    ]);

    let allConversations: Conversation[] = [];

    // Process regular conversations
    if (Array.isArray(conversationsData.conversations)) {
      const conversationsWithDetails = await Promise.all(
        conversationsData.conversations.map(async (conv: any) => {
          try {
            const otherId = accountType === 'company' ? conv.userId : conv.companyId;
            const otherType = accountType === 'company' ? 'userId' : 'companyId';
            const detailsRes = await fetch(`/api/user-details?${otherType}=${otherId}`);
            
            if (!detailsRes.ok) {
              return { ...conv, type: 'conversation' as const };
            }

            const detailsData = await detailsRes.json();

            if (detailsData.user || detailsData.company) {
              const otherParty = detailsData.user || detailsData.company;
              return {
                ...conv,
                type: 'conversation' as const,
                otherParty: {
                  ...otherParty,
                  type: detailsData.user ? 'user' as const : 'company' as const
                }
              };
            }
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Failed to fetch details for conversation', conv.id, error);
            }
          }
          return { ...conv, type: 'conversation' as const };
        })
      );
      allConversations = [...conversationsWithDetails];
    }

    // Add support tickets as conversations
    if (Array.isArray(supportData.tickets)) {
      const supportConversations: Conversation[] = supportData.tickets.map((ticket: any) => ({
        id: `support-${ticket.id}`,
        type: 'support' as const,
        ticketId: ticket.id,
        subject: ticket.subject,
        lastBody: ticket.message,
        lastAt: ticket.updatedAt || ticket.createdAt,
        status: ticket.status,
        unreadCount: ticket.unreadCount || 0,
        otherParty: {
          firstName: lang === 'ar' ? 'الدعم الفني' : 'Technical Support',
          lastName: `#${ticket.id}`,
          username: 'support',
          type: 'support' as const,
          image: null
        }
      }));
      allConversations = [...allConversations, ...supportConversations];
    }

    // Sort by last activity
    allConversations.sort((a, b) => {
      const dateA = new Date(a.lastAt || 0).getTime();
      const dateB = new Date(b.lastAt || 0).getTime();
      return dateB - dateA;
    });

    return { conversations: allConversations };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching conversations:', error);
    }
    return { 
      conversations: [], 
      error: error instanceof Error ? error.message : 'Failed to load conversations'
    };
  }
}
