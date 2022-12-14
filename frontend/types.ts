export type TokenData = {
    token: string;
}

export type User = {
    id: number;
    username: string;
    display_name: string | null;
    bio: string;
    follower_count: number;
    like_count: number;
    post_count: number;
    is_following: boolean;
    is_self: boolean;
    banner: null | string | File;
    avatar: null | string | File;
    postIds?: number[];
    likedIds?: number[];
    postIdsEnd?: boolean;
    likedIdsEnd?: boolean;
}
export type Post = {
    id: number;
    author: User;
    author_id: number;
    title: string | null;
    content: string;
    has_liked: boolean;
    like_count: number;
    comment_count: number;
    timestamp: number;
    privacy: 'all' | 'semi' | 'private';
    attachments: Attachment[];
    hasCommentsFetched?: boolean;
    hasLoadedLatestComments?: boolean;
    hasLoadedTopComments?: boolean;
}
export type Comment = {
    id: number;
    author_id: number;
    post_id: number;
    author: User;
    content: string;
    timestamp: number;
    has_liked: boolean;
    like_count: number;
    orderType?: 'top' | 'latest';
}

export type Channel = {
    id: number;
    icon: string | null;
    name: string | null;
    type: number;
    recipients: User[];
    unread_count: number;
    last_message: Message | null;
    typing?: number;
    reachedEnd?: boolean;
}
export type Message = {
    id: number;
    channel_id: number;
    author_id: number;
    author: User;
    content: string;
    timestamp: number;
    loading?: boolean;
    tempId?: number;
    failed?: boolean;
}

export type Notification = {
    id: number;
    reference: Message | Post;
    user_reference: User;
    type: 0 | 2;
    unread: boolean;
    created_at: number;
}

export type Attachment = {
    id: number;
    extension: string;
    parent_id: number;
}
export type TempAttachment = {
    preview: string;
    file?: File;
    id: number;
}