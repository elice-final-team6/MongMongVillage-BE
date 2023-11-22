const Board = require('../board/model/board.schema');
const { User } = require('../user/model/user.schema');
const Like = require('../board/model/like.schema');
const Comment = require('./model/comment.schema');

exports.createComment = async ({ userId, boardId, content }) => {
    try {
        const board = await Board.findById({ _id: boardId });
        if (!board) {
            return {
                status: 404,
                message: '존재하지 않는 게시글입니다.'
            }
        }
        const comment = await Comment.create({
            user_id: userId,
            board_id: boardId,
            content: content
        });
        const commenters = board.comment_id;
        commenters.push(comment['_id']);
        await board.updateOne({ comment_id: commenters});

        return {
            status: 201,
            comment,
        }
    } catch (error) {
        throw error;
    }
}

exports.updateComment = async ({ boardId, userId, commentId, content }) => {
    try {
        const board = await Board.findById({ _id: boardId });
        if (!board) {
            return {
                status: 404,
                message: '존재하지 않는 게시글입니다.'
            }
        }
        const comment = await Comment.findOneAndUpdate(
                                { _id: commentId, user_id: userId, board_id: board._id }, 
                                { content: content }, 
                                { new: true })
                                .select('_id user_id content createdAt updatedAt');
        console.log(comment);
        if (!comment){
            return {
                status: 400,
                message:'댓글 수정 실패'
            }
        }
        return {
            status: 200,
            board_id: boardId,
            comment
        }
    } catch (error) {
        throw error;
    }
}

exports.deleteComment = async ({ boardId, commentId, userId }) => {
    try {
        const board = await Board.findById({ _id: boardId });
        if (!board) {
            return {
                status: 404,
                message: "존재하지 않는 게시글입니다."
            }
        }
        const comment = await Comment.findOneAndDelete({ _id: commentId, user_id: userId });
        if (!comment) {
            return {
                status: 400,
                message: '댓글 삭제 실패'
            }
        }
        console.log(comment);

        const commenters = board.comment_id;
        const idx = commenters.map((cId, idx) => {
            if (cId.toString() === commentId) 
                return idx;
        });
        commenters.splice(idx, 1);
        await board.updateOne({ comment_id: commenters});

        return {
            status: 200,
            board_id: boardId,
        }
    } catch (error) {
        throw error;
    }
}

exports.getUserComments = async (userId) => {
    try {
        const user = await User.findById({ _id: userId })
                                .select('_id nickname image');
        if (!user) {
            return {
                status: 404,
                message: "존재하지 않는 사용자입니다."
            } 
        }
        const comments = await Comment.find({ user_id: userId })
                                .select('_id board_id content createdAt updatedAt');
        if (!comments.length) {
            return {
                status: 404,
                message: "댓글이 존재하지 않습니다."
            }
        }
        return {
            status: 200,
            user,
            comments,
        }
    } catch (error) {
        throw error;
    }
}