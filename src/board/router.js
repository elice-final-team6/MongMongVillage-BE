const express = require('express');
const router = express.Router();
const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

const boardService = require('./service');

const s3 = new S3Client({
    region : 'ap-northeast-2',
    credentials : {
        accessKeyId : process.env.S3_ACCESS_KEY_ID,
        secretAccessKey : process.env.S3_SECRET_ACCESS_KEY,
    }
});
  
const upload = multer({
    storage: multerS3({
    s3: s3,
    bucket: 'mongmongvillagebucket',
        key: function (req, file, cb) {
        cb(null, `board/${Date.now()}_${path.basename(file.originalname)}`) //업로드시 파일명 변경가능
    }
    }),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// 로그인 검사
router.post('/', upload.array('images'), async (req, res, next) => {
    try {
       const { title, content, animalType, category } = req.body;
       const userId = '655ac300ee052627917debf7';
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

// 로그인 검사
router.delete('/:id', async (req, res, next) => {
    try {
        const userId = '655ac300ee052627917debf7';
        const boardId = req.params.id;
        const deleteBoardResult = await boardService.deleteBoard(userId, boardId);
        if (deleteBoardResult.status === 200)
            return res.status(200).json(deleteBoardResult);
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
        const currentPage = req.query.currentPage || 1;
        const perPage = 4;
        const allBoardsResult = await boardService.getAllBoards(currentPage, perPage);
        return res.status(200).json(allBoardsResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/category/:name', async (req, res, next) => {
    try {
        const currentPage = req.query.currentPage || 1;
        const perPage = 4;
        const category = req.params.name;
        const categoryBoardsResult = await boardService.getCategoryBoards(category, currentPage, perPage);
        if (categoryBoardsResult.status === 404) 
            return res.status(404).send(categoryBoardsResult.message);
        return res.status(200).json(categoryBoardsResult)
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

// 좋아요를 눌렀다면 좋아요 취소, 아니면 좋아요 생성
// 로그인 검사
router.put('/:id/liked', async (req, res, next) => {
    try {
        const userId = '655ac300ee052627917debf7';
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

router.get('/:id', async (req, res, next) => {
    try {
        const boardId = req.params.id;
        const boardDetailResult = await boardService.getDetailBoard(boardId);

        if (boardDetailResult.status === 400) {
            return res.status(400).json(boardDetailResult);
        }
        return res.status(200).json(boardDetailResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 로그인 검사
router.get('/mypage/user', async (req, res, next) => {
    try {
        // 로그인 했는지 검사
        const userId = '655ac300ee052627917debf7';
        const userBoardsResult = await boardService.getUserBoards(userId);
        return res.status(200).json(userBoardsResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 회원이 좋아요 누른 게시글 목록
router.get('/mypage/user/liked', async (req, res, next) => {
    try {
        const userId = '655ac300ee052627917debf7';
        const userLikedBoardResult = await boardService.getUserLikedBoards(userId);
        if (userLikedBoardResult.message) {
            res.status(404).send(userLikedBoardResult.message);
        }
        return res.status(200).json(userLikedBoardResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;
