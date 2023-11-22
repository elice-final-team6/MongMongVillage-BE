const express = require('express');
const router = express.Router();

const JwtMiddleware = require("../middleware/jwt-handler");
const commentService = require('./service');

router.post('/boards/:id', JwtMiddleware.checkToken, async (req, res, next) => {
    try {
        const boardId = req.params.id;
        const userId = req.token.userId;
        const content = req.body.content;
        const createCommentResult = await commentService.createComment({ userId, boardId, content });
        console.log(createCommentResult);
        if (createCommentResult.message)
            return res.status(400).send(createCommentResult.message);
        return res.status(201).json(createCommentResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.patch('/:id/boards/:boardId', JwtMiddleware.checkToken, async (req, res, next) => {
    try {
        const commentId = req.params.id;
        const userId = req.token.userId;
        const boardId = req.params.boardId;
        const content = req.body.content;
        const updateCommentResult = await commentService.updateComment({ boardId, userId, commentId, content });
        if (updateCommentResult.message) {
            return res.status(updateCommentResult.status).send(updateCommentResult.message);
       }
        return res.status(200).json(updateCommentResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.delete('/:id/boards/:boardId', JwtMiddleware.checkToken, async (req, res, next) => {
    try {
        const commentId = req.params.id;
        const boardId = req.params.boardId;
        const userId = req.token.userId;
        const deleteCommentResult = await commentService.deleteComment({ boardId, commentId, userId });
        if (deleteCommentResult.message) {
            return res.status(deleteCommentResult.status).send(deleteCommentResult.message);
       }
        return res.status(200).json(deleteCommentResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
})

router.get('/mypage/user', JwtMiddleware.checkToken, async (req, res, next) => {
    try {
       const userId = req.token.userId;
       const userCommentsResult = await commentService.getUserComments(userId);
       if (userCommentsResult.message) {
            return res.status(userCommentsResult.status).send(userCommentsResult.message);
       }
       return res.status(200).json(userCommentsResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
})
module.exports = router;