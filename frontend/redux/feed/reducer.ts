import { AnyAction } from "redux";
import { createReducer, updateObject } from "../utils";
import { ADD_FEED_POST_IDS, SET_FEED_POST_IDS } from "./constants"
import { FeedState, Reducer } from "./types"

// Reducer actions
type ReducerAction = (state: FeedState, action: AnyAction) => FeedState;

const setFeedPostIds: ReducerAction = (state, action) => {
    return updateObject(state, { postIds: action.payload })
}

const addFeedPostIds: ReducerAction = (state, action) => {
    return updateObject(state, {
        postIds: state.postIds.concat(action.payload)
    })
}

// Creating reducer
export const feedReducer = createReducer({
    postIds: [],
    loading: true
}, {
    SET_FEED_POST_IDS: setFeedPostIds,
    ADD_FEED_POST_IDS: addFeedPostIds
})