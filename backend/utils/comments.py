import time
from typing import Union
from database import db
from random import randrange
from utils.common import create_id, get_user_by_id
from utils.likes import get_like, get_like_count

"""
Function to get a comment by its id.
"""
def get_comment_by_id(id: int, token_id: Union[int, None]=None):
    query = """
    SELECT
        c.*,
        COUNT(DISTINCT l.user_id) AS like_count,
        IF(l2.user_id IS NULL, FALSE, TRUE) AS has_liked 
    FROM comments c
        LEFT JOIN likes l ON l.parent_id = c.id
        LEFT JOIN likes l2 ON l.user_id = %s
    WHERE
        c.id = %s
    GROUP BY
        c.id, c.content, c.author_id, c.post_id, c.timestamp, l2.user_id
    """
    values = (token_id, id)

    # Fetching comment
    comment = db.fetch_one(query, values)

    if comment:
        # Adding comment author
        comment['author'] = get_user_by_id(comment['author_id'], token_id)

        # Replacing mysqls bool value for has_liked
        comment['has_liked'] = bool(comment['has_liked'])

    return comment

"""
Function to get a posts comments. Comments are fetched based on an order_by property.
This property is either top or latest, whereas top will sort comments based on popularity
and latest by the created_at timestamp.
"""
def get_post_comments(post_id: int, token_id: Union[int, None]=None, order_by='top', start_at=0, amount=15):
    # Fetching top liked comments
    query = ""
    if order_by == 'top':
        query = """
        SELECT
            comments.id,
            COUNT(likes.user_id) AS like_count
        FROM comments
            LEFT JOIN likes ON comments.id = likes.parent_id
        WHERE 
            comments.post_id = %s
        GROUP BY comments.id
        ORDER BY like_count DESC
        LIMIT %s, %s
        """
    elif order_by == 'latest':
        query = "SELECT id FROM comments WHERE post_id = %s ORDER BY timestamp DESC LIMIT %s, %s"

    values = (post_id, start_at, amount)

    # Fetching comments
    data = db.fetch_all(query, values)

    # If no comments are fetched
    if not data: return []

    # For each comment id, fetch attached information
    comments = []
    comment_ids = [item['id'] for item in data]
    for comment_id in comment_ids:
        comment = get_comment_by_id(comment_id, token_id)
        comments.append(comment)

    return comments

"""
Function to get a posts comment count.
"""
def get_post_comment_count(post_id: int):
    query = "SELECT COUNT(*) as count FROM comments WHERE post_id = %s"
    values = (post_id,)

    data = db.fetch_one(query, values)

    # Getting comment count
    count = 0
    if data and 'count' in data:
        count = data['count']

    return count

"""
Function to create a post comment.
"""
def create_post_comment(post_id: int, data):
    # Using posts here to make sure postIds and commentIds cant be the same
    id = create_id('posts')

    # Creating query
    query = "INSERT INTO comments (id, post_id, author_id, content, timestamp) VALUES (%s, %s, %s, %s, %s)"
    values = (
        id,
        post_id,
        data['author_id'],
        data['content'],
        time.time()
    )

    # Inserting comment
    db.insert(query, values)

    # Fetching created comment
    comment = get_comment_by_id(id)
    
    return comment

"""
Function to delete a comment.
"""
def delete_comment(comment_id: int):
    query = "DELETE FROM comments WHERE id = %s"
    like_query = "DELETE FROM likes WHERE parent_id = %s"
    values = (comment_id,)

    db.delete(query, values)
    db.delete(like_query, values)