const Board = require('./model/board.schema');
const User = require('../user/model/user.schema');
const Like = require('../board/model/like.schema');
const Comment = require('../comment/model/comment.schema');

exports.createBoard = async ({ userId, title, content, animalType, category, imageUrl }) => {
    try {
        animalType = animalType || null;
        category = category || null;

        const board = await Board.create({
            user_id: userId,
            comment_id: [],
            title: title,
            content: content,
            images: imageUrl,
            animal_type: animalType,
            like_count: 0,
            category: category,
        });
        console.log(board);
        return {
            status: 201,
            board_id: board['_id'],
            message: '게시글이 성공적으로 작성되었습니다.'
        }
    } catch (error) {
        throw error;
    }
}

exports.updateBoard = async () => {

}

exports.deleteBoard = async (userId, boardId) => {
    try {
        const result = await Board.findOneAndDelete({ _id: boardId, user_id: userId });
        if (!result) {
            return {
                status: 404,
                message: '존재하지 않는 게시글입니다.'
            }
        }
        return {
            status: 200,
            message: '게시글이 삭제되었습니다.'
        }
    } catch (error) {
        throw error;
    }
}

exports.getAllBoards = async (currentPage, perPage) => {
  try {
    const total_number_of_boards = await Board.countDocuments({});
    const boards = await Board
                .find({})
                .sort({createdAt: -1})
                .skip((currentPage - 1) * perPage)
                .limit(perPage)
                .populate({ path: 'user_id', select: '_id image nickname' });
    if (boards.length === 0) {
        return {
            status: 404,
            message: '게시글이 존재하지 않습니다.'
        }
    }
    return {
        status: 200,
        total_number_of_boards,
        boards,
    }
  } catch (error) {
    throw error;
  }
}

exports.getCategoryBoards = async (category, currentPage, perPage) => {
    try {
        const total_number_of_boards = await Board.countDocuments({ category: category });
        const boards = await Board 
                    .find({ category: category })
                    .sort({ createdAt: -1 })
                    .skip((currentPage - 1) * perPage)
                    .limit(perPage);
        return {
            status: 200,
            total_number_of_boards, 
            boards,
        }
    } catch (error) {
        throw error;
    }
}

// 홈 페이지 상위 4개 게시글(좋아요순 기준 같으면 최신순)
exports.getBestBoards = async () => {
    try {
        const boards = await Board.find({})
                    .populate({ path: 'user_id', select: '_id nickname' })
                    .sort('-like_count -createdAt')
                    .limit(4)
                    .select('_id images title like_count')
        return {
            status: 200,
            boards,
        }
    } catch (error) {
        throw error;
    }
}

exports.getUserBoards = async (userId) => {
    try {
        const board = await Board.find({ user_id: userId });
        if (board.length === 0) {
            return {
                status: 404,
                message: "게시글이 존재하지 않습니다."
            }
        }
        return {
            status: 200,
            board,
        }
    } catch (error) {
        throw error;
    }
}

exports.getUserLikedBoards = async (userId) => {
    try {
        const liked = await Like.find({ user_id: userId })
                        .populate({ path: 'user_id', select: '_id nickname image'})
                        .populate({ path: 'board_id', select: '_id title content createdAt updatedAt comment_id' })
                        .select('_id user_id board_id');

        if (liked.length === 0) {
            return {
                status: 404,
                message: "게시글이 존재하지 않습니다."
            }
        }
        return {
            status: 200,
            liked,
        }
    } catch (error) {
        throw error;
    }
}

exports.getDetailBoard = async (boardId) => { 
    try {
        const board = await Board.findOne({ _id: boardId })
            .populate({ path: 'user_id', select: '_id nickname image' });
        const comments = await Comment.find({ board_id: boardId })
            .select('_id user_id content createdAt updatedAt')
            .populate({ path: 'user_id', select: '_id image nickname' });

        console.log('게시글: ', board);
        console.log('댓글: ', comments);
        if (!board) {
            return {
                status: 404,
                message: '존재하지 않는 게시글입니다.'
            }
        }
        return {
            status: 200,
            board,
            comments,
        }
    } catch (error) {
        throw error;
    }
}

exports.getLiked = async (boardId, userId) => {
    try {
        const isLikedResult = await Like.findOne({ board_id: boardId, user_id: userId });
        console.log(isLikedResult);
        if (isLikedResult === null) return { checked: false };
        else return { checked: true };
    } catch (error) {
        throw error;
    }
}
// 좋아요 생성
exports.setLiked = async (boardId, userId) => {
    try {
        await Like.create({
            user_id: userId,
            board_id: boardId,
        });
        const likeCount = await Like.countDocuments({ board_id: boardId });

        await Board.findByIdAndUpdate(boardId, { like_count: likeCount });
        return {
            status: 201,
            is_liked: true,
            message: '좋아요 생성',
        }
    } catch (error) {
        throw error;
    }
}

// 좋아요 취소
exports.deleteLiked = async (boardId, userId) => {
    try {
        const result = await Like.findOneAndDelete({ board_id: boardId, user_id: userId });

        if (!result) {
            return {
                status: 400,
                message: '좋아요 취소 실패'
            }
        }
        const likeCount = await Like.countDocuments({ board_id: boardId });

        await Board.findByIdAndUpdate(boardId, { like_count: likeCount });
        return {
            status: 200,
            is_liked: false,
            message: '좋아요 취소'
        }
    } catch (error) {
        throw error;
    }
}
