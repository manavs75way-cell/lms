export interface DashboardSummary {
    totalBooks: number;
    totalCopies: number;
    availableCopies: number;
    borrowedCopies: number;
    totalMembers: number;
    activeBorrows: number;
    overdueBorrows: number;
    totalFinesPending: number;
}

export interface RecentBorrow {
    borrowId: string;
    bookTitle: string;
    bookISBN: string;
    userName: string;
    userEmail: string;
    borrowDate: string;
    dueDate: string;
    daysLeft: number;
    fineAmount: number;
    status: string;
}

export interface OverdueBorrow {
    borrowId: string;
    bookTitle: string;
    userName: string;
    userEmail: string;
    daysOverdue: number;
    fineAmount: number;
}

export interface TopBook {
    bookId: string;
    title: string;
    isbn: string;
    borrowCount: number;
}

export interface ActiveMember {
    userId: string;
    name: string;
    email: string;
    borrowCount: number;
    totalFine: number;
}

export interface PredictiveHold {
    editionId: string;
    title: string;
    isbn: string;
    currentReservations: number;
    predictedReservations: number;
    confidence: number;
    trend: 'RISING' | 'STABLE' | 'DECLINING';
    isOverridden?: boolean;
    overrideReason?: string;
    edition?: {
        _id: string;
        isbn: string;
        format: string;
        work: {
            title: string;
        };
    };
}

export interface LibrarianDashboardData {
    summary: DashboardSummary;
    recentBorrows: RecentBorrow[];
    overdueList: OverdueBorrow[];
    topBooks: TopBook[];
    activeMembers: ActiveMember[];
    predictiveHolds: PredictiveHold[];
}

export interface DashboardResponse {
    success: boolean;
    data: LibrarianDashboardData;
}
