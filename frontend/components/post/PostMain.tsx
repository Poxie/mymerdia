import { useEffect, useMemo } from "react"
import { useDispatch } from "react-redux"
import { useAuth } from "../../contexts/auth/AuthProvider"
import { useQueryId } from "../../hooks/useQueryId"
import { setPost } from "../../redux/posts/actions"
import { selectPostMain } from "../../redux/posts/selectors"
import { useAppSelector } from "../../redux/store"
import { Post } from "../../types"
import { UserPostFooter } from "../user-post/UserPostFooter"
import { UserPostHeader } from "../user-post/UserPostHeader"
import { PostContent } from "./PostContent"
import { PostMainSkeleton } from "./PostMainSkeleton"
import { PostTitle } from "./PostTitle"

export const PostMain = () => {
    const { get, loading } = useAuth();
    const postId = useQueryId('postId');
    const post = useAppSelector(state => selectPostMain(state, postId));
    const dispatch = useDispatch();

    // Fetching post on mount
    useEffect(() => {
        if(loading || post) return;

        get<Post>(`/posts/${postId}`)
            .then(post => {
                dispatch(setPost(post));
            })
    }, [get, loading, post, postId]);

    if(!post) return <PostMainSkeleton />;

    const {
        id,
        author,
        timestamp,
        title,
        content
    } = post;
    return(
        <>
        <UserPostHeader 
            user={author}
            timestamp={timestamp}
            postId={id}
        />
        <PostTitle title={title} />
        <PostContent content={content} />
        <UserPostFooter id={id} />
        </>
    )
}