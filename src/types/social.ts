export interface Rating {
    id: string;
    painting_id: string;
    rating: number;
    ip_hash?: string;
    created_at: string;
}

export interface Comment {
    id: string;
    painting_id: string;
    user_name: string;
    content: string;
    reply?: string; // Admin reply
    is_approved: boolean;
    created_at: string;
    paintings?: {
        title: string;
        image_url: string;
    };
}

// Stats aggregation specific to a painting
export interface SocialStats {
    averageRating: number | null;
    totalRatings: number;
    commentsCount: number;
}
// CMS Content Interface
export interface SiteContent {
    slug: string;
    content: string;
    updated_at?: string;
}
