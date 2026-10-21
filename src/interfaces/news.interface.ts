export interface Article {
    id: string;
    title: string;
    description: string;
    url: string;
    image: string | null;
    publishedAt: string;
    source: string;
}

export interface NewsQuery {
    language: string;
    limit: number;
}
