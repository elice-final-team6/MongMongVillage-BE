const express = require('express');
const router = express.Router();

const { boardJoiSchema } = require('./model/board.schema');
const JwtMiddleware = require("../middleware/jwt-handler");
const JWT = require("../utils/jwt");
const { imageUploadConfig } = require('../utils/s3-multer');
const boardsUpload = imageUploadConfig('board');
const boardService = require('./service');

router.post('/', JwtMiddleware.checkToken, boardsUpload.array('images'), async (req, res, next) => {
    try {
       const userId = req.token.userId;
       const { title, content, animalType, category } = req.body;
       await boardJoiSchema.validateAsync({ title, content });

       let imageUrl = [];
       if (req.files.length > 0) {
         imageUrl = req.files.map((file) => file.location);
         console.log(imageUrl);
       }
       const createBoardResult = await boardService.createBoard({ userId, title, content, animalType, category, imageUrl });
       return res.status(201).json(createBoardResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.patch('/:id', JwtMiddleware.checkToken, boardsUpload.array('images'), async (req, res, next) => {
    try {
        const userId = req.token.userId;
        const boardId = req.params.id;
        const { title, content, animalType, category } = req.body;
        await boardJoiSchema.validateAsync({ title, content });

        let imageUrl = [];
        if (req.files.length > 0) {
            imageUrl = req.files.map((file) => file.location);
            console.log(imageUrl);
        }
        const updateBoardResult = await boardService.updateBoard({ boardId, userId, title, content, animalType, category, imageUrl })
        if (updateBoardResult.message)
            return res.status(404).send(updateBoardResult.message);
        else
            return res.status(200).send(updateBoardResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.delete('/:id', JwtMiddleware.checkToken, async (req, res, next) => {
    try {
        const userId = req.token.userId;
        const boardId = req.params.id;
        const deleteBoardResult = await boardService.deleteBoard(userId, boardId);
        if (deleteBoardResult.status === 200)
            return res.status(200).send(deleteBoardResult.message);
        else
            return res.status(404).send(deleteBoardResult.message);
    } catch (error) {
        console.error(error);
        next(error);
    }

});

// 게시글 조회 + 페이지네이션
router.get('/', async (req, res, next) => {
    try {
        let sortBy;
        if (!req.query.sortBy) sortBy = '-createdAt';
        else if (req.query.sortBy === 'likes') sortBy = '-like_count';
        else return res.status(400).send('잘못된 요청입니다.');
        const currentPage = req.query.currentPage || 1;
        const perPage = 10;
        const allBoardsResult = await boardService.getAllBoards(currentPage, perPage, sortBy);
        return res.status(200).json(allBoardsResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/category/:name', async (req, res, next) => {
    try {
        let sortBy;
        if (!req.query.sortBy) sortBy = '-createdAt';
        else if (req.query.sortBy === 'likes') sortBy = '-like_count';
        else return res.status(400).send('잘못된 요청입니다.');

        const currentPage = req.query.currentPage || 1;
        const perPage = 10;
        const category = req.params.name;
        if (category !== 'info' 
            && category !== 'general' 
            && category !== 'question'
        ) return res.status(400).send('해당 카테고리가 존재하지 않습니다.');

        const categoryBoardsResult = await boardService.getCategoryBoards({ category, currentPage, perPage, sortBy });
        if (categoryBoardsResult.message) 
            return res.status(400).send(categoryBoardsResult.message);
        return res.status(200).json(categoryBoardsResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/best', async (req, res, next) => {
    try {
        const bestBoardResult = await boardService.getBestBoards();
        return res.status(200).json(bestBoardResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/search', async (req, res, next) => {
    try {
        const currentPage = req.query.currentPage || 1;
        const perPage = 10;
        const content = req.query.content;
        const searchBoardsResult = await boardService.getSearchBoards(content, currentPage, perPage);
        if (searchBoardsResult.message) {
            return res.status(400).send(searchBoardsResult.message);
        }
        return res.status(200).json(searchBoardsResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
})

// 좋아요를 눌렀다면 좋아요 취소, 아니면 좋아요 생성
router.put('/:id/liked', JwtMiddleware.checkToken, async (req, res, next) => {
    try {
        const userId = req.token.userId;
        const boardId = req.params.id;
        const isLiked = await boardService.getLiked(boardId, userId);
        let likedBoardResult;

        if (isLiked.message) 
            return res.status(404).send(isLiked.message);

        if (!isLiked.checked) 
            likedBoardResult = await boardService.setLiked(boardId, userId);
        else
            likedBoardResult = await boardService.deleteLiked(boardId, userId);

        if (likedBoardResult.status === 400) {
            return res.status(400).send(likedBoardResult.message);
        }
        return res.status(200).json(likedBoardResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 게시글 상세 조회
router.get('/:id', async (req, res, next) => {
    res.locals.boardId = req.params.id;
    if (req.header("Authorization")) next();
    else next('route');
}, async (req, res, next) => { // 로그인 한 유저라면 게시글 좋아요 눌렀는지 확인할 수 있는 isLiked 추가
    try {
        req.token = JWT.verifyToken(req.header("Authorization").split(" ")[1]);
        if (req.token.userId) {
            const isLiked = await boardService.getLiked(res.locals.boardId, req.token.userId);
            const boardDetailResult = await boardService.getDetailBoard(res.locals.boardId);
            if (boardDetailResult.message) {
                return res.status(400).send(boardDetailResult.message);
            }
            return res.status(200).json({ isLiked, ...boardDetailResult });
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 로그인 하지 않은 유저가 게시글 조회할 때
router.get('/:id', async (req, res, next) => {
    try {
        const boardDetailResult = await boardService.getDetailBoard(res.locals.boardId);

        if (boardDetailResult.message) {
            return res.status(400).send(boardDetailResult.message);
        }
        return res.status(200).json(boardDetailResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/mypage/user', JwtMiddleware.checkToken, async (req, res, next) => {
    try {
        const userId = req.token.userId;
        const userBoardsResult = await boardService.getUserBoards(userId);
        return res.status(200).json(userBoardsResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 회원이 좋아요 누른 게시글 목록
router.get('/mypage/user/liked', JwtMiddleware.checkToken, async (req, res, next) => {
    try {
        const userId = req.token.userId;
        const userLikedBoardResult = await boardService.getUserLikedBoards(userId);
        return res.status(200).json(userLikedBoardResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;
